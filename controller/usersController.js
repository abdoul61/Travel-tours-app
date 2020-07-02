//const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/usersModels');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

//HERE I CREATE THE STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // USER-HFLSHJK898390NNFBI3IU3O-98383884788.JPEG
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

// HERE I CRATE THE THEN MULTER FILTER TO TEST THE TYPE OF DATA BEING UPLOADING
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only. images', 400), false);
  }
};

// HERE I FINALLY UPLOAD THE DATA
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// HERE IS TO UPLOAD THE USER PHOTO

exports.uploadUserPhoto = upload.single('photo');

// HERE IS THE MIDDLEWARE THAT RESIZE THE PHOTO BEFORE UPLOADING
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );
const filterObje = (obj, ...allowFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};
exports.gettAllUsers = factory.getAll(User);
// exports.gettAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     timeSent: req.requesTime,
//     data: {
//       users,
//     },
//   });
// });
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user post password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update please use /updateMypasword.',
        400
      )
    );
  }

  //2) update user  document
  const filteredBody = filterObje(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});
// HERE IS THE USER THAT DELETED HIMSELF SO THE DATA WILL STILL REMAINDS
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'this route is not yet define and please use sign up instead',
  });
};
// HERE IS THE ADMIN THAT DELETE DE USER DEFINITLY
// do not try to update tre password with this one
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
