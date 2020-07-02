const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./usersModels');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tours most have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have a lenght equal or less than 40 characteres',
      ],
      minlength: [10, ' A tour must have more or equal than 10 characteres'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour most have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy ,meduim or difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'a tours most have a price'],
    },
    PriceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only work for the create a new a document
          return val < this.price;
        },
      },
      message:
        'Discount price ({VALUE}) should be lower than the regular price',
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be above 1.0'],
      max: [5, 'A rating must be lower than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'A tour mmsut have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour mus have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      coordinates: {
        type: [Number],
      },
      address: {
        type: String,
      },
      description: String,
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
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
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// THIS HOW YOU USE VIRTUAL POPULATE

toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// THIS THE MIDDLEWARE : that only run before the .save() .create()
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});
// HERE IS THE EMBEDING FORM FOR GRTTING THE TOUR GUARD
// toursSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// THE QUERY MIDDLEWARE with the regular expression(/^find/ wich means that everething that started with the word find)

toursSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  this.start = Date.now();
  next();
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChnageAt',
  });
  next();
});
toursSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});
//   AGGREGATION MIDDLEWARE

// toursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: {
//       secretTour: {
//         $ne: true,
//       },
//     },
//   });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
