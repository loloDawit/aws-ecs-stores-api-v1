const Store = require('../models/Stores');
const crypro = require('crypto');
const User = require('../models/Users');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @Description    Get all users
 * @Route          GET /api/v1/auth/users
 * @Access         Private
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filterQuery);
});

/**
 * @Description    Get a single user
 * @Route          GET /api/v1/auth/user
 * @Access         Private
 */
exports.getAUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: user
  });
});
/**
 * @Description    Create a single user
 * @Route          POST /api/v1/auth/users
 * @Access         Private
 */
exports.createAUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    success: true,
    data: user
  });
});
/**
 * @Description    Update a single user
 * @Route          PUT /api/v1/auth/users/:id
 * @Access         Private
 */
exports.updateAUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: user
  });
});
/**
 * @Description    Delete a single user
 * @Route          DELETE /api/v1/auth/users/:id
 * @Access         Private
 */
exports.deleteAUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: 'User Deleted'
  });
});
