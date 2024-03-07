const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan'); // Import morgan
const app = express();
const PORT = process.env.PORT || 3000;
const config = require('./config');

// Middleware to parse JSON requests
app.use(express.json());

// Load environment variables from .env file
require('dotenv').config();

// Use morgan middleware for logging
app.use(morgan('dev'));

// DB config
const MONGODB_URI = process.env.MONGODB_URI || require('./config').mongoDB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Check Connection
let db = mongoose.connection;
db.once('open', () => {
    console.log('Database connected successfully!');
});

// Check for DB Errors
db.on('error', (error) => {
    console.log(error);
});

// Require the index router
const indexRouter = require('./routes/index');

// Set up a view engine
app.set('view engine', 'ejs');

// Set a static folder
app.use(express.static('public'));

// Define the index router
app.use('/', indexRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
