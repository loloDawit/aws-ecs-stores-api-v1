const express = require('express');
const path = require('path');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
// Load the enviroment variables
require('dotenv').config();
// Load routes
const stores = require('./routes/stores');
const auth = require('./routes/auth');
const users = require('./routes/admin');

// Middleware
const errorHandler = require('./middleware/error');
//connect to database
connectDB();
const app = express();

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// DB protection:
app.use(mongoSanitize());
// Security features
app.use(helmet());
// More security and remove scripts
app.use(xss());
// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
});
app.use(limiter);
// prevent hpp param pollution
app.use(hpp());
// Enable CORS
app.use(cors());

// logs HTTP responses
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Use static file and folders
app.use(express.static(path.join(__dirname, 'public')));

// Mount the routes
app.use('/api/v1/stores', stores);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bold.green);
});

// Handle all promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
