const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeature');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    const nam = 'doc';
    if (!doc) {
      return next(new AppError(`no ${nam} found for that Id`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('no document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);

    const doc = await query;
    if (!doc) {
      return next(new AppError('no document  found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // TO ALLOW FOR nexted reviews on tour(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //BUILT QUERY
    const feature = new APIFeatures(req.query, Model.find(filter))
      .filter()
      .sorting()
      .limitsFields()
      .paginate();

    // EXECUTE THE QUERY &
    // const docs = await feature.query.explain();
    const docs = await feature.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      timeSent: req.requesTime,
      data: {
        data: docs,
      },
    });
  });
