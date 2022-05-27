const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStores,
  updateStore,
  getStore,
  createStore,
  deleteStore,
  getNewRelicData,
  getFLSStores,
  getRackStores,
  getTrunkClubStores,
  getCanadaRackStores,
  getCanadaFLSStores
} = require('../controllers/stores');

const filterQuery = require('../middleware/filter');
const storeData = require('../models/Stores');

router
  .route('/')
  .get(protect, filterQuery(storeData), getStores)
  .post(protect, authorize('datapublisher', 'admin'), createStore);
router.route('/newrelic').get(getNewRelicData);
router.route('/FLS').get(protect, getFLSStores);
router.route('/rack').get(protect, getRackStores);
router.route('/ca/rack').get(protect, getCanadaRackStores);
router.route('/ca/fls').get(protect, getCanadaFLSStores);
router.route('/trunkclub').get(getTrunkClubStores);
router
  .route('/:id')
  .get(protect, getStore)
  .put(protect, authorize('datapublisher', 'admin'), updateStore)
  .delete(protect, authorize('datapublisher', 'admin'), deleteStore);

module.exports = router;
