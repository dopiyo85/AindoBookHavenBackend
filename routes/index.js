const express = require('express');
const app = express();
const booksRouter = require('../routes/books');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public', express.static('public'));

// Routes to manage Schemas
app.use('/api/books', booksRouter);

// Export the app to be used as the main application
module.exports = app;