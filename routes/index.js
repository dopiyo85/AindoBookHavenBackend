const express = require('express');
const app = express();
const booksRouter = require('../routes/books');
const usersRouter = require('../routes/users');
const cartItemsRouter = require('../routes/cartItems');
const ordersRouter = require('../routes/orders');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public', express.static('public'));

// Routes to manage Schemas
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/cartItems', cartItemsRouter);
app.use('/api/orders', ordersRouter);

// Export the app to be used as the main application
module.exports = app;