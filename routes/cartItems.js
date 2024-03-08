const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CartItem = require('../models/cartItem');
const Book = require('../models/book');

// Add Item to Cart Route
router.post('/add', async (req, res) => {
    try {
        const { bookId, quantity } = req.body;

        // Validate the format of the bookId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: 'Invalid bookId format' });
        }

        // Check if the book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found in store or Sold out' });
        }

        // Check if the item already exists in the cart
        let cartItem = await CartItem.findOne({ book: bookId });

        if (cartItem) {
            // Update quantity if the item already exists
            cartItem.quantity += quantity;
        } else {
            // Create a new cart item if it doesn't exist
            cartItem = new CartItem({
                book: bookId,
                quantity,
                price: book.price
            });
        }

        // Save the cart item
        await cartItem.save();

        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Remove Item from Cart Route
router.delete('/remove/:bookId', async (req, res) => {
    try {
        const bookId = req.params.bookId;

        // Find and delete the cart item with the given book ID
        await CartItem.findOneAndDelete({ book: bookId });

        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Item Quantity Route
router.put('/update/:bookId', async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const { quantity } = req.body;

        // Find the cart item with the given book ID
        let cartItem = await CartItem.findOne({ book: bookId });

        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity of the cart item
        cartItem.quantity = quantity;

        // Save the updated cart item
        await cartItem.save();

        res.status(200).json({ message: 'Item quantity updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
