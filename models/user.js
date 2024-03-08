const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    oldPassword: {
        type: String,
        required: false // Not required for initial registration
    },
    newPassword: {
        type: String,
        required: false // Not required for initial registration
    },
    confirmPassword: {
        type: String,
        required: false // Not required for initial registration
    }
});

// Create a User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
