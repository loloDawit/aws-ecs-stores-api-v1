const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  //Log to console for Dev env
  console.log(err.stack.red);
  console.log(err.name);

  /**
   * Mondgoose ObjectID Errors
   */

  // Check for CastError
  if (err.name === 'CastError') {
    const message = `Resource not found.`;
    error = new ErrorResponse(message, 404);
  }
  // Check for Duplicate value error ==> E11000
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }
  // Check ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
