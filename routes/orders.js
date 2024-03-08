const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Book = require('../models/book');
const User = require('../models/user');
const CartItem = require('../models/cartItem');
const PDFDocument = require('pdfkit');

// Checkout Route
router.post('/checkout', async (req, res) => {
    try {
        const { user, items, shippingAddress, paymentMethod } = req.body;

        // Fetch user details from the database based on the user ID
        const userDetails = await User.findById(user);
        if (!userDetails) {
            return res.status(404).json({ message: `User with ID ${user} not found` });
        }

        const userName = userDetails.username;

        // Calculate total amount based on the prices of items in the cart
        let totalAmount = 0;
        const itemDetails = []; // Array to store item details for the receipt
        for (const itemId of items) {
            const cartItem = await CartItem.findById(itemId);
            if (!cartItem) {
                return res.status(404).json({ message: `CartItem with ID ${itemId} not found` });
            }
            const item = await Book.findById(cartItem.book);
            if (!item) {
                return res.status(404).json({ message: `Book with ID ${cartItem.book} not found` });
            }
            const itemTotal = cartItem.quantity * item.price;
            totalAmount += itemTotal;
            itemDetails.push({ title: item.title, quantity: cartItem.quantity, price: item.price, total: itemTotal });
        }

        // Create a new order instance
        const order = new Order({
            user,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        // Save the order to the database
        await order.save();

        // Generate PDF receipt
        const doc = new PDFDocument();
        const filename = `receipt-${Date.now()}.pdf`; // filename
        doc.pipe(res); // Pipe the PDF document to the response

        // Add content to the PDF document
        doc.fontSize(18).text('Book Sale Receipt', { align: 'center', underline: true, bold: true }).moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`).moveDown();
        doc.fontSize(12).text(`Time: ${new Date().toLocaleTimeString()}`).moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`).moveDown();
        doc.fontSize(12).text(`User: ${userName}`).moveDown();
        doc.fontSize(12).text(`Shipping Address: ${shippingAddress}`).moveDown();
        doc.fontSize(12).text(`Payment Method: ${paymentMethod}`).moveDown();

        // Add items to the receipt
        doc.fontSize(14).text('Books Purchased:', { underline: true }).moveDown();
        for (const item of itemDetails) {
            doc.fontSize(12).text(`${item.title} : ${item.quantity} @ KES${item.price} Total KES ${item.total}`, { bold: true }).moveDown();
        }

        doc.moveDown(2); // Add some space
        doc.fontSize(12).text(`Thank you ${userName} for Buying from: Aindo Book Haven Stores`, { align: 'right', bold: true }).moveDown();

        doc.end(); // Finalize the PDF document
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Update Order Route
router.put('/update/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { user, items, shippingAddress, paymentMethod } = req.body;

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch user details from the database based on the user ID
        const userDetails = await User.findById(user);
        if (!userDetails) {
            return res.status(404).json({ message: `User with ID ${user} not found` });
        }

        const userName = userDetails.username; 

        // Validate and calculate total amount based on items
        let totalAmount = 0;
        const itemDetails = []; // Array to store item details for the receipt
        for (const item of items) {
            // Ensure each item has valid quantity and price
            if (!item.quantity || !item.price) {
                return res.status(400).json({ message: 'Invalid item format' });
            }
            const cartItem = await CartItem.findById(item.id);
            if (!cartItem) {
                return res.status(404).json({ message: `CartItem with ID ${item.id} not found` });
            }
            const book = await Book.findById(cartItem.book);
            if (!book) {
                return res.status(404).json({ message: `Book with ID ${cartItem.book} not found` });
            }
            const itemTotal = item.quantity * item.price;
            totalAmount += itemTotal;
            itemDetails.push({ title: book.title, quantity: item.quantity, price: book.price, total: itemTotal });
        }

        // Update order details
        order.user = user;
        order.items = items.map(item => item.id); // Extract item ids
        order.totalAmount = totalAmount;
        order.shippingAddress = shippingAddress;
        order.paymentMethod = paymentMethod;

        // Save the updated order
        await order.save();

        // Generate PDF receipt
        const doc = new PDFDocument();
        const filename = `receipt-${orderId}.pdf`; // filename with order ID
        doc.pipe(res); // Pipe the PDF document to the response

        // Add content to the PDF document
        doc.fontSize(18).text('Book Sale Receipt', { align: 'center', underline: true, bold: true }).moveDown();
        doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`).moveDown();
        doc.fontSize(12).text(`Time: ${new Date().toLocaleTimeString()}`).moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`).moveDown();
        doc.fontSize(12).text(`User: ${userName}`).moveDown();
        doc.fontSize(12).text(`Shipping Address: ${shippingAddress}`).moveDown();
        doc.fontSize(12).text(`Payment Method: ${paymentMethod}`).moveDown();

        // Add items to the receipt
        doc.fontSize(14).text('Books Purchased:', { underline: true }).moveDown();
        for (const item of itemDetails) {
            doc.fontSize(12).text(`${item.title} : ${item.quantity} @ KES${item.price} Total KES ${item.total}`, { bold: true }).moveDown();
        }

        doc.moveDown(2); // Add some space
        doc.fontSize(12).text(`Thank you ${userName} for Buying from: Aindo Book Haven Stores`, { align: 'right', bold: true }).moveDown(); // Add signature

        doc.end(); // Finalize the PDF document
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Delete Order Route
router.delete('/delete/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find and delete the order by ID
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;