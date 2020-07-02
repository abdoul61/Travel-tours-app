//const AppError = require('../utils/AppError');
const Reviews = require('../models/reviewModels');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Reviews);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Reviews.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Reviews.findById();
//   if (!review) {
//     return next(new AppError('no review found for that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
exports.setTourUserId = (req, res, next) => {
  // ALLOWS NESTED  ROUTER TO WORK FINE
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Reviews);
// exports.createReview = catchAsync(async (req, res, next) => {
// //   const newReview = await Reviews.create(req.body);

// //   res.status(201).json({
// //     status: 'success',
// //     data: {
// //       newReview,
// //     },
// //   });
// // });
exports.getReview = factory.getOne(Reviews);
exports.updateReview = factory.updateOne(Reviews);
exports.deleteReviews = factory.deleteOne(Reviews);
// exports.gettAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();
//     res.status(200).json({
//       status: 'success',
//       results: users.length,
//       timeSent: req.requesTime,
//       data: {
//         users,
//       },
//     });
//   });
