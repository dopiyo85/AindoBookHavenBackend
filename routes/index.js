const express = require('express');
const app = express();
const booksRouter = require('../routes/books');

// Import other routers for different functionalities
// const usersRouter = require('./routes/users');
// const cartRouter = require('./routes/cart');
// const paymentRouter = require('./routes/payment');
// Middleware
app.use(express.json());

// Serve static files from the 'static' directory
app.use('/public', express.static('public'));

// Use the books router for managing books
app.use('/api/books', booksRouter);

// Define routes for other functionalities
// Route for the root path (/)
app.get('/', (req, res) => {
  res.send('Welcome to AindoBookHaven!');
});

// Example of a route for a specific functionality
app.get('/about', (req, res) => {
  res.send('About AindoBookHaven');
});

// Export the app to be used as the main application
module.exports = app;
