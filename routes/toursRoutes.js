const express = require('express');

const toursController = require('../controller/toursController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewsRoutes');

const router = express.Router();

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.RestrictTo('user'),
//     reviewController.createReview
//   );
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(toursController.TopTours, toursController.gettAlltours);

router.route('/tour-stats').get(toursController.getTourStat);
router
  .route('/tour-plan/:year')
  .get(
    authController.protect,
    authController.RestrictTo('admin', 'lead-guide', 'guide'),
    toursController.getMonthlyPlan
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(toursController.getTourWithin);
router.route('/distances/:latlng/unit/:unit').get(toursController.getDistances);
router
  .route('/')
  .get(toursController.gettAlltours)
  .post(
    authController.protect,
    authController.RestrictTo('admin', 'lead-guide'),
    toursController.createTours
  );

router
  .route('/:id')
  .get(toursController.getAtour)
  .patch(
    authController.protect,
    authController.RestrictTo('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTours
  )
  .delete(
    authController.protect,
    authController.RestrictTo('admin', 'lead-guide'),
    toursController.deleteTour
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.RestrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
