const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.RestrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.RestrictTo('user', 'admin'),
    reviewController.deleteReviews
  )
  .patch(
    authController.RestrictTo('user', 'admin'),
    reviewController.updateReview
  );
// router.route('/:id').get(reviewController.getReview);
module.exports = router;
