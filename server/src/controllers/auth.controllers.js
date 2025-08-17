// const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.models");
const authService = require('../services/auth.service');


// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send JWT token
const createSendToken = (user, statusCode, req, res, message = 'Success') => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user
    }
  });
};

// @desc    Register new user
// @access  Public
// user registration routes
const signUpPage = (req, res) => {
    /**
     * * Note: In a real application, you would typically render a signup form here
     * * or return a JSON response with the necessary data for the frontend.
     * 
     * uncomment the following line if you want to render a view
    */
   
   const locals = {
       title: 'Sign Up',
       description: 'Create a new account',
    };
    
    res.send("User Signup Page");
    res.status(200);
    res.render('signUpPage', { locals });
};
const signUpUser = async(req, res) => {
    // Logic for signing up a user
    
    /**
     * * Note: In a real application, you would typically save the user data to the database
     * * and handle any validation or error checking.
     * 
     * uncomment the following line if you want to render a view
    */

    if (!req.body.firstName || !req.body.lastName || !req.body.userName || !req.body.email || !req.body.phoneNumber || !req.body.password) {
        res.status(400).send("All fields are required");
        return;
    }

    try {
        // Check if user already exists
        const userAvailable = await User.findOne({email: req.body.email});
        if (userAvailable) {
            res.status(400);
            return res.send("User already exists with this email");
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        if (!hashedPassword) {
            res.status(500).send("Error hashing password");
            return;
        }
        console.log("Hashed Password:", hashedPassword);
    
        // Create a new user
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword,
        });
    
        await User.create(newUser);
        console.log(`New User Created: ${newUser}`);

        // Generate email verification token
        const verifyToken = await authService.generateEmailVerificationToken(newUser);

        // Send verification email (implement this in your email service)
        try {
          await authService.sendVerificationEmail(newUser, verifyToken);
        } catch (err) {
            console.error('Email sending failed:', err);
            // Don't fail registration if email fails
        }

        createSendToken(newUser, 201, req, res, 'User registered successfully. Please check your email for verification.');



        // Send a response back to the client
        if (newUser) {
            console.log("User signed up successfully");
            res.status(201).json({ 
                success: true,
                message: "User signed up successfully",
                data: {
                    user: {
                        id: newUser._id,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        userName: newUser.userName,
                        email: newUser.email,
                        phoneNumber: newUser.phoneNumber,
                    },
                },
            });
            res.send("User signed up successfully");
            res.redirect('/');
            
        } else {
            res.status(500).send("Error signing up user");
            console.error("Error signing up user");
            return;
        }
        
    } catch (error) {
        console.error("Error signing up user:", error);
        // res.status(500).send("Internal Server Error");
    }

};


// user login routes
const logInPage = (req, res) => {
    /**
     * * Note: In a real application, you would typically render a login form here
     * * or return a JSON response with the necessary data for the frontend.
     * 
     * uncomment the following line if you want to render a view
    */

   const locals = {
       title: 'Log In',
       description: 'Log in to your account',
    };

    res.send("User Login Page");
    res.status(200);
    res.render('logInPage', { locals });
};
const logInUser = async (req, res) => {
	// Logic for logging in a user

	/**
	 * * * Note: In a real application, you would typically check the user's credentials
	 * * against the database and handle any validation or error checking.
	 * * uncomment the following line if you want to render a view
	 */

	// Check if email and password exist
	if (!req.body.email || !req.body.password) {
		res.status(400).send("Email and password are required");
		return;
	}

	// Check if user exists and password is correct
	const userlogInDetails = await User
		.findOne(req.body.email)
		.select("+password");
	if (!userlogInDetails) {
		res.status(401).send("Invalid email or password");
	}

	// Check if account is locked
	if (userlogInDetails.isLocked) {
		return res.status(423).json({
			success: false,
			message: "Account temporarily locked due to too many failed login attempts. Try again later.",
		});
	}

	// Check if user is active
	if (!userlogInDetails.isActive) {
		return res.status(403).json({
			success: false,
			message: "Account is inactive. Please contact support.",
		});
	}

	// Check if password is correct
	const isPasswordCorrect = await bcrypt.compare(
		req.body.password,
		userlogInDetails.password
	);
	if (!isPasswordCorrect) {
		// Increment failed login attempts
		userlogInDetails.failedLoginAttempts += 1;
		await userlogInDetails.save();
		return res.status(401).json({
			success: false,
			message: "Invalid email or password",
		});
	}

	// Reset login attempts on successful login
	if (userlogInDetails.loginAttempts > 0) {
		await userlogInDetails.resetLoginAttempts();
	}

    // Update last login
    userlogInDetails.lastLoginAt = new Date();
	await userlogInDetails.save(
        { 
            validateBeforeSave: false,
            runValidators: true,
            context: 'update',
            new: true,
            useFindAndModify: false,
            runValidators: true,
        }
    );

    // If everything ok, send token to client
    createSendToken(userlogInDetails, 200, req, res, "Login successful");


	res.send("User logged in successfully");
	res.status(200).json({
		success: true,
		message: "User logged in successfully",
		data: {
			user: {
				id: userlogInDetails._id,
				firstName: userlogInDetails.firstName,
				lastName: userlogInDetails.lastName,
				userName: userlogInDetails.userName,
				email: userlogInDetails.email,
				phoneNumber: userlogInDetails.phoneNumber,
			},
		},
	});
};

module.exports = {
    signUpPage,
    signUpUser,
    logInPage,
    logInUser,
};