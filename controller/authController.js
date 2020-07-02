const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/usersModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');

const SignToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};
const createSendToken = (user, statusCode, res) => {
  const token = SignToken(user._id);
  // HERE WE SEND THE COKIES TO THE CURENT USER
  const cookiesOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookiesOption.secure = true;
  res.cookie('jwt', token, cookiesOption);
  //REMOVE THE PASSWORD
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    PasswordChangedAt: req.body.PasswordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1 ) checq if user exists && password id coorect
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }
  //2) check if the userame and the password is correct
  const user = await User.findOne({
    email,
  }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3)if everythinq is okay send the token
  createSendToken(user, 200, res);
});
exports.logOut = (req, res) => {
  res.cookie('jwt', ' hahah you out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting the token and checking if they are there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in Please log in to get access.', 401)
    );
  }

  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)check if if the user still exist

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'the user belonging to this token does not longer exists',
        401
      )
    );
  }

  //4)check if the user changed the password afetr the token was issue
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password  please log in again',
        401
      )
    );
  }
  //GRANT ACCESS TO USER
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// ONLY FOR RENDER PAGES THERE WILL NO ERRORS

exports.isLoggedIn = async (req, res, next) => {
  try {
    //1) getting the token and checking if they are there

    if (req.cookies.jwt) {
      //2)verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3)check if if the user still exist

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //4)check if the user changed the password afetr the token was issue
      if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }
      //THERE IS A LOOGED IN USER
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.RestrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide'] role = user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not the permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetPass = catchAsync(async (req, res, next) => {
  // 1) LETS GET THE USER BASED ON POSTES EMAIL

  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //	49608
  //Open TCP Port: 	57548
  //Open TCP Port: 	57992
  // 2 ) GENERATE THE RANDOM RESTE TOKEN
  const resetToken = user.createPasswordTokenRset();
  await user.save({ validateBeforeSave: false });

  try {
    //3) SEND IT TOT HE USER EMAIL
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    //console.log(await sendEmail(user.email, message));
    user.PasswordResetToken = undefined;
    user.PasswordResetExpire = undefined;
    await user.save();
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPass = catchAsync(async (req, res, next) => {
  //1) GET USER BASE ON THE TOKEN
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    PasswordResetToken: hashToken,
    PasswordResetExpire: { $gte: Date.now() },
  });
  //2) IF THE TOKEN HAS NOT EXPIRED AND THERE IS A URSER SET THER NEW USER
  if (!user) {
    return next(new AppError('Token is invalide or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpire = undefined;
  await user.save();
  //3)UPDATE CHANGEDPASSWORD PROPRETU FOR THE USER

  //4 LOG THE USR IN AND SEND TJWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get the user from the collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check is popsted current paswsord is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3) if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) log user in send JWT
  createSendToken(user, 200, res);
});
