const Tour = require('../models/toursModels');
const Booking = require('../models/bookingModel');
const User = require('../models/usersModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is not tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
exports.getSignUp = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for a new account for free',
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  //1 find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2 find tours withs  the returned IDS
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatUser,
  });

  console.log(req.body);
});
