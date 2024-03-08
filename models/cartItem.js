const mongoose = require('mongoose');

// Define shopping cart item schema
const cartItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', // Reference to the Book model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

// Create a model for the shopping cart item schema
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
