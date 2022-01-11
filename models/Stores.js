const mongoose = require('mongoose');
const NodeGeocoder = require('node-geocoder');

var options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https', // Default
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

const StoreSchema = new mongoose.Schema(
  {
    storeNo: {
      type: String,
      required: [true, 'Please add a store number'],
      //unique: true,
      trim: true,
      maxlength: [5, 'Store number can not be more than 5 characters'],
    },

    storeName: {
      type: String,
      required: [true, 'Please add a store name'],
      //unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    contact: {
      tie_line: String,
      phone: String,
      faxTieLine: String,
      fax: String,
    },
    // address: {
    //   type: String,
    //   required: [true, 'Please add an address'],
    // },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        index: '2dsphere',
      },
      formattedAddress: String,
      address: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    businessType: {
      businessUnit: {
        type: String,
        required: [true, 'Please add a business unit'],
      },
      region: String,
      rack_district: String,
      pres_class: String,
      isFlagship: {
        type: Boolean,
        default: false,
      },
    },
    store_open_date: {
      type: Date,
    },
    storeMgr: {
      name: String,
      email: {
        type: String,
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please use a valid email',
        ],
      },
      phone: String,
    },
    storeAdmin: {
      name: String,
      email: {
        type: String,
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please use a valid email',
        ],
      },
      phone: String,
    },
    HRMgr: {
      name: String,
      email: {
        type: String,
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please use a valid email',
        ],
      },
      phone: String,
    },
    reginalMgr: {
      name: String,
      email: {
        type: String,
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please use a valid email',
        ],
      },
      phone: String,
    },
    reginalAdmin: {
      name: String,
      email: {
        type: String,
        match: [
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          'Please use a valid email',
        ],
      },
      phone: String,
    },

    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
StoreSchema.index({ name: 1, type: -1 }, { unique: false });
/**
 * Geocoder
 * create location
 */
StoreSchema.pre('save', async function (next) {
  const _location = await geocoder.geocode({
    address: this.location.address,
    zipcode: this.location.zipcode,
  });

  this.location = {
    type: 'Point',
    coordinates: [_location[0].longitude, _location[0].latitude],
    formattedAddress: _location[0].formattedAddress,
    address: this.location.address,
    street: _location[0].streetName,
    city: _location[0].city,
    state: _location[0].stateCode,
    zipcode: _location[0].zipcode,
    country: _location[0].countryCode,
  };
  // since address is modified, set it to null
  // this.address = undefined;
  next();
});
module.exports = mongoose.model('storeData', StoreSchema);
