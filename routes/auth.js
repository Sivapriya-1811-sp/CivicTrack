
const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// CITIZEN REGISTRATION
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, password, address } = req.body;

        // Check required fields
        if (!fullName || !email || !phone || !password || !address) {
            return res.status(400).json({
                message: 'Please fill in all required fields.'
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create citizen
        const newUser = new User({
            fullName,
            email: email.toLowerCase().trim(),
            phone,
            password: hashedPassword,
            address,
            role: 'citizen'
        });

        await newUser.save();

        res.status(201).json({
            message: 'Registration successful!',
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            message: 'Server error during registration.'
        });
    }
});


// CITIZEN LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            message: 'Server error during login.'
        });
    }
});

module.exports = router;
