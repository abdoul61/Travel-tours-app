const mongoose = require('mongoose');
const Tour = require('./toursModels');

const reviewSchema = new mongoose.Schema(
  {
    review: [
      {
        type: String,
        required: [true, ' the revirew can not be empty'],
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review muste belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, ' review must belong to a user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
// THIS INDEX OBLIGATE THAT EACH  REVIEW SHOULB BE UNIQUE A USER
reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  }
);
// THIS MIDDLEWARE POPULATE OUR TOUR AND USER ON REVIEW INSTANCES
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//THIS IS TO CALCULATE THE AVERAGE RATING WITH THE METHOD AGREGATE
reviewSchema.statics.calcAverageRtings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
// HERE WE CALL THE METHOD TO SEE HOW IT WORK
reviewSchema.post('save', function () {
  // THIS POOINT TO THE CURRENT REVIEW
  this.constructor.calcAverageRtings(this.tour);
});
//HERE IS THE PRE MIDDLEWARE TO UPDATE OR DELETE
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does Not work here , query has already executed
  // console.log(this.r);
  await this.r.constructor.calcAverageRtings(this.r.tour._id);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
