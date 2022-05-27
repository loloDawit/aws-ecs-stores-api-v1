const storeData = require('../models/Stores');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

//TODO Add advance filtering and sorting to all endpoints

/**
 * @description Get all stores
 * @routes      GET/api/v1/stores
 * @access      Private
 */
exports.getStores = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filterQuery);
});

/**
 * @description Get a store
 * @routes      GET/api/v1/store/:id
 * @access      Private
 */
exports.getStore = asyncHandler(async (req, res, next) => {
  const store = await storeData.findById(req.params.id);

  if (!store) {
    return next(new ErrorResponse(`Store not found with the id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: store
  });
});
/**
 * @description Get FullLine stores
 * @routes      GET/api/v1/store/FLS
 * @access      Private
 */
exports.getFLSStores = asyncHandler(async (req, res, next) => {
  var request = {
    'businessType.businessUnit': 'FLS'
    // 'businessType.businessUnit': 'FLS CANADA',
  };
  const store = await storeData.find(request);
  if (!store) {
    return next(new ErrorResponse('No stores found!', 404));
  }

  res.status(200).json({
    success: true,
    total: store.length,
    data: store
  });
});
/**
 * @description Get Canada FullLine stores
 * @routes      GET/api/v1/store/ca/FLS
 * @access      Private
 */
exports.getCanadaFLSStores = asyncHandler(async (req, res, next) => {
  var request = {
    'businessType.businessUnit': 'FLS CANADA'
  };
  const store = await storeData.find(request);
  if (!store) {
    return next(new ErrorResponse('No stores found!', 404));
  }

  res.status(200).json({
    success: true,
    total: store.length,
    data: store
  });
});
/**
 * @description Get Rack stores
 * @routes      GET/api/v1/store/rack
 * @access      Private
 */
exports.getRackStores = asyncHandler(async (req, res, next) => {
  var request = {
    'businessType.businessUnit': 'RACK'
  };
  const store = await storeData.find(request);
  if (!store) {
    return next(new ErrorResponse('No stores found!', 404));
  }
  res.status(200).json({
    success: true,
    total: store.length,
    data: store
  });
});
/**
 * @description Get Canada Rack stores
 * @routes      GET/api/v1/store/ca/rack
 * @access      Private
 */
exports.getCanadaRackStores = asyncHandler(async (req, res, next) => {
  var request = {
    'businessType.businessUnit': 'RACK CANADA'
  };
  const store = await storeData.find(request);
  if (!store) {
    return next(new ErrorResponse('No stores found!', 404));
  }
  res.status(200).json({
    success: true,
    total: store.length,
    data: store
  });
});
/**
 * @description Get TrunkClub stores
 * @routes      GET/api/v1/store/trunkclub
 * @access      Private
 */
exports.getTrunkClubStores = asyncHandler(async (req, res, next) => {
  var request = {
    'businessType.businessUnit': 'TRUNK CLUB'
    // 'businessType.businessUnit': 'RACK CANADA',
  };
  const store = await storeData.find(request);
  if (!store) {
    return next(new ErrorResponse('No stores found!', 404));
  }

  res.status(200).json({
    success: true,
    total: store.length,
    data: store
  });
});
/**
 * @description Get data for newRelic project
 * @routes      GET /api/v1/stores
 * @access      Private
 */
exports.getNewRelicData = asyncHandler(async (req, res, next) => {
  const data = await storeData.find();
  if (!data) {
    return next(new ErrorResponse('No store data found!!', 404));
  }
  var newRelicData = {
    items: []
  };

  for (let index = 0; index < data.length; index++) {
    var externalId = data[index].storeNo;
    var title = data[index].storeName;
    var city = data[index].location.city;
    var stateCode = data[index].location.state;
    var zipcode = data[index].location.zipcode;
    const countryCode = data[index].location.country;
    var latitude = data[index].location.coordinates[0];
    var longitude = data[index].location.coordinates[1];

    newRelicData.items.push({
      externalId,
      title: title,
      location: {
        municipality: city,
        region: stateCode,
        country: countryCode,
        postalCode: zipcode,
        description: title,
        lat: latitude,
        lng: longitude
      }
    });
  }
  console.log(newRelicData.items.length);

  res.status(200).json({
    success: true,
    total: newRelicData.items.length,
    newRelicData
  });
});
/**
 * @description Create a store
 * @routes      POST /api/v1/stores
 * @access      Private
 */
exports.createStore = asyncHandler(async (req, res, next) => {
  const store = await storeData.create(req.body);
  res.status(201).json({
    success: true,
    data: store
  });
});
/**
 * @description Update store
 * @routes      GET/api/v1/stores/:id
 * @access      Private
 */
exports.updateStore = asyncHandler(async (req, res, next) => {
  const store = await storeData.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!store) {
    return res.status(400).json({ success: false });
  }
  res.status(200).json({
    success: true,
    data: store
  });
});
/**
 * @description Delete a store
 * @routes      GET/api/v1/stores/:id
 * @access      Private
 */

exports.deleteStore = asyncHandler(async (req, res, next) => {
  const store = await storeData.findByIdAndDelete(req.params.id);
  if (!store) {
    return next(new ErrorResponse(`Store not found with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});
