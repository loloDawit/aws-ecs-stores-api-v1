const express = require('express');
const {
  registerUser,
  signInUser,
  getSelf,
  resetPassword,
  resetPasswordUsingToken,
  updateUserDetails,
  updateUserPassword,
  logout
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);
router.post('/signin', signInUser);
router.get('/me', protect, getSelf);
router.post('/resetpassword', resetPassword);
router.put('/resetpassword/:resettoken', resetPasswordUsingToken);
router.put('/updateuser', protect, updateUserDetails);
router.put('/updatepassword', protect, updateUserPassword);
router.get('/logout', protect, logout);
module.exports = router;
