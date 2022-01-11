const fs = require('fs');

const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
// Load the enviroment variables
dotenv.config({ path: 'config/config.env' });
const storeData = require('./models/Stores');
const load = require('ora');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const spinner = load('Extracting and saving store info...');
const stores = JSON.parse(
  fs.readFileSync(`${__dirname}/data/store.data.json`, 'utf-8')
);

const importData = async () => {
  try {
    await storeData.create(stores);
    console.log('Data imported to the database'.white.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const removeData = async () => {
  try {
    await storeData.deleteMany();
    console.log('Data deleted from the database'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  spinner.start();
  importData();
  spinner.stop();
} else if (process.argv[2] === '-d') {
  spinner.start();
  removeData();
  spinner.stop();
}
