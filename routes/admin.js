const express = require('express');
const User = require('../models/Users');
const { getAUser, getAllUsers, updateAUser, createAUser, deleteAUser } = require('../controllers/admin');
const filterQuery = require('../middleware/filter');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(filterQuery(User), getAllUsers).post(createAUser);

router.route('/:id').get(getAUser).put(updateAUser).delete(deleteAUser);

module.exports = router;
