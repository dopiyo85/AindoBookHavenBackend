const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const { body, validationResult, check } = require('express-validator'); // For input validation
const nodemailer = require('nodemailer'); // For sending emails
const User = require('../models/user');

// Validation middleware for registration input
const validateRegisterInput = [
    check('username', 'Username is required').notEmpty(),
    check('email', 'Email is required').notEmpty(),
    check('email', 'Invalid email format').isEmail(),
    check('password', 'Password is required').notEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('password', 'Password must contain at least one lowercase letter').matches(/[a-z]/),
    check('password', 'Password must contain at least one uppercase letter').matches(/[A-Z]/),
    check('password', 'Password must contain at least one digit').matches(/[0-9]/),
    check('password', 'Password must contain at least one special character').matches(/[!@#$%^&*(),.?":{}|<>]/)
];

// Validation middleware for password change input
const validateChangePasswordInput = [
    check('oldPassword', 'Old password is required').notEmpty(),
    check('newPassword', 'New password is required').notEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
    check('newPassword', 'New password must contain at least one lowercase letter').matches(/[a-z]/),
    check('newPassword', 'New password must contain at least one uppercase letter').matches(/[A-Z]/),
    check('newPassword', 'New password must contain at least one digit').matches(/[0-9]/),
    check('newPassword', 'New password must contain at least one special character').matches(/[!@#$%^&*(),.?":{}|<>]/)
];

// Validation middleware for forgot password input
const validateForgotPasswordInput = [
    check('email', 'Email is required').notEmpty(),
    check('email', 'Invalid email format').isEmail(),
];

// Registration route with input validation
router.post('/register', validateRegisterInput, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Destructure user data from request body
        const { username, email, password } = req.body;

        // Check if user with provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the new user to the database
        await newUser.save();

        // Respond with success message
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // Handle server errors
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        // Destructure email and password from request body
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // If user does not exist, respond with error message
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // If passwords do not match, respond with error message
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token with user ID as payload
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with success message and token
        res.json({ message: 'Login successful', token });
    } catch (error) {
        // Handle server errors
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Password change route with input validation and confirmation
router.post('/change-password/:userId', validateChangePasswordInput, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.params.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Verify the JWT token and extract the user ID
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authenticatedUserId = decoded.userId;

        // Check if the authenticated user is authorized to change the password for the specified user ID
        if (authenticatedUserId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to change the password for this user' });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare old password with the stored password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Check if the new password matches the confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Forgot password route
router.post('/forgot-password', validateForgotPasswordInput, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // If user does not exist, respond with error message
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate JWT token with user ID as payload for password reset link
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send password reset link to user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Password Reset Link',
            text: `Click the following link to reset your password: ${process.env.RESET_PASSWORD_URL}/${token}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Password reset link sent to your email' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
