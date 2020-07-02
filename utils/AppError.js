class AppError extends Error {
  constructor(message, statusCode) {
    // because  parent class only accept message
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // console.log(Error)
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
