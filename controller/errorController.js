const AppError = require('../utils/AppError');

const handlErrorDBD = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDulicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate field value:${value} please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = ` Invalide input data : ${error.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTerror = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleExpeditorError = () =>
  new AppError('Your token has expire please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  }
  // B) RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A)Operation , trusted error: send message to  client
  // this is for the  API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //B) Programming or unknown error: don't leak error details
    //1)
    console.log('ERROR', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  // FOR THE RENDER WEBSITE
  // A)Operation , trusted error: send message to  client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong!',
      msg: err.message,
    });
  }
  //B) Programming or other unknown error: don't leak any details
  console.log('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') error = handlErrorDBD(error);
    if (err.code === 11000) error = handleDulicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTerror();
    if (err.name === 'TokenExpiredError') error = handleExpeditorError();
    sendErrorProd(error, req, res);
  }
};
