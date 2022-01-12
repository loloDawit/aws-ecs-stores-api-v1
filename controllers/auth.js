const User = require('../models/Users');
const Store = require('../models/Stores');
const crypro = require('crypto');
const moment = require('moment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
//const sendEmail = require('../utils/sendemail');

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_Username,
      pass: process.env.SMTP_Password
    }
  });
  // send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject, // Subject line
    text: options.message // plain text body
  };
  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

/**
 * * Description    Register user
 * * Route          POST /api/v1/auth/register
 * * Access         Public
 */
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role
  });
  // Create token and send
  sendTokenResponse(user, 200, res);
});
/**
 * * Description    Sign in registered users using the token
 * * Route          POST /api/v1/auth/login
 * * Access         Public
 */
exports.signInUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password is right
  if (!email || !password) {
    return next(new ErrorResponse('Validation failed, please check you have the correct password and email', 400));
  }
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Validation failed, Invalid password/email', 401));
  }
  // validate the password
  const _comparePassword = await user.validateHashedPassword(password);
  if (!_comparePassword) {
    return next(new ErrorResponse('Validation failed, Invalid password/email', 401));
  }
  //Create token and send
  sendTokenResponse(user, 200, res);
});

/**
 * @description Get current logged in user
 * @route       POST /api/v1/auth/admin
 * @access      Private
 */
exports.getSelf = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});
/**
 * @description Logged out user
 * @route       GET /api/v1/auth/logout
 * @access      Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    success: true,
    data: {}
  });
});
/**
 * @description Update user details
 * @route       PUT /api/v1/auth/updateuser
 * @access      Private
 */
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const updateFields = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});
/**
 * @description Update user password
 * @route       PUT /api/v1/auth/password
 * @access      Private
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  //check current passowrd
  if (!(await user.validateHashedPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});
/**
 * @description Reset forgot password
 * @route       POST /api/v1/auth/resetpassword
 * @access      Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse(`User with email '${req.body.email}' not found!`, 404));
  }
  const resetToken = user.getPasswordResetToken();
  console.log('printing resettoken....', resetToken);

  await user.save({
    validateBeforeSave: false
  });
  // creat reset url
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `Per your request,
  here is the link to reset your password.
  Make sure to make a PUT request to: \n\n ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });
    res.status(200).json({
      success: true,
      data: 'Email Sent'
    });
  } catch (error) {
    console.log(error);
    user.resetPassword = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({
      validateBeforeSave: false
    });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});
/**
 * @description Reset password using the reset token
 * @route       PUT /api/v1/auth/resetpassword/:resettoken
 * @access      Public
 */
exports.resetPasswordUsingToken = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypro.createHash('sha256').update(req.params.resettoken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 *
 * @param {*} user          User from the db
 * @param {*} statusCode    Status code of the response
 * @param {*} response      New token and create cookie
 */
const sendTokenResponse = (user, statusCode, response) => {
  const token = user.getSignedJSONWebToken();
  console.log('checkToken', token);
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_DATE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  console.log('options', options);
  var expiresIn = moment(options.expires).format('dddd, MMMM Do YYYY, h:mm:ss a');

  var scope = {
    apiOwner: 'NOC',
    access: user.role
  };
  if (process.env.NODE_ENV === 'production') {
    options.sercure = true;
  }
  response.status(statusCode).cookie('token', token, options).json({
    success: true,
    access_token: token,
    expires_in: expiresIn,
    scope
  });
};
