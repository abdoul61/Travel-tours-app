const path = require('path');
const express = require('express');
const morgan = require('morgan');

//  ALL THESE FIVE ARE FOR SECURITY PURPOSE
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatzise = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// ALL THESE ARE COMING FROM EXTERNAL ROUTER
const AppeError = require('./utils/AppError');
const errorGlobalHandling = require('./controller/errorController');
const tourRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRouter');

// CREATING THE MAIN APP FROM EXPRESS
//start express
const app = express();
// here we use pu as a server rendereing template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

console.log(process.env.NODE_ENV);
//1) GLOBOL MIDDLEWARES
// THIS  is for serving static file
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//  SET SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPEMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: ' Too many request from this IP please try agin in an hour!',
});
app.use('/api', limiter);

// THE BODY PARSER , reading data from into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limits: '10kb',
  })
);
//PARSE DATA FROM COOKIE
app.use(cookieParser());
// HERE WE DO DATA SANITIZATION AGAINST NOsql query injection
app.use(mongoSanatzise());

// HER WE DO DATA SANITIZATION against xss
app.use(xss());

// PREVENT PARAMS POLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// This just a test middleware
app.use((req, res, next) => {
  req.requesTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});
app.use('/', viewRouter);
app.use('/tours/tour', viewRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// HERE IS FOR THE ROUTE THAT DO NOT MATCH USER ROUTE OR TOUR ROUTE
app.all('*', (req, res, next) => {
  next(new AppeError(`can't find ${req.originalUrl} on this server`, 404));
});
//HOW TO HANDLE MIDDLEWASRE FOR ERROR HANDLING
// app.use((err, req, res, next) => {
//   console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(errorGlobalHandling);
module.exports = app;
