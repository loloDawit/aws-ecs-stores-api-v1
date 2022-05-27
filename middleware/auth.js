/**
 * * Middleware to Protect Private Routes
 */

const JSONWebToken = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/Users');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route!', 401));
  }

  try {
    const decoded = JSONWebToken.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // currently logged in user
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route!', 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Not authorized!!! User role <${req.user.role}> Not authorized to access this route!. Contact the administrator.`,
          403
        )
      );
    }
    next();
  };
};
