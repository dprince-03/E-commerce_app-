const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const user = require('../models/user.models');

// home page route
const homePage = (req, res) => {
    res.send('User Home Page')
    res.status(200);
};

// Admin dashboard route
const adminDashboard = (req, res) => {
    res.send('Admin Dashboard');
    res.status(200);
};
const adminDashboardPost = (req, res) => {
    // Logic for handling admin dashboard post requests
    res.send('Admin Dashboard Post Request Handled');
    res.status(200);
};

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
        const userAvailable = await user.findOne({email: req.body.email});
        if (userAvailable) {
            res.status(400);
            return res.send("User already exists with this email");
        }
    
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        // Create a new user
        const newUser = new user({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword,
        });
    
        await user.create(newUser);
    
        res.send("User signed up successfully");
        res.status(201);
        res.redirect('/');
        
    } catch (error) {
        console.error("Error signing up user:", error);
        res.status(500).send("Internal Server Error");
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
const logInUser = (req, res) => {
    // Logic for logging in a user

    /**
     * * * Note: In a real application, you would typically check the user's credentials
     * * against the database and handle any validation or error checking.
     * * uncomment the following line if you want to render a view
     */

    
    res.send("User logged in successfully");
    res.status(200);
};

module.exports = {
    homePage,
    adminDashboard,
    adminDashboardPost,
    signUpPage,
    signUpUser,
    logInPage,
    logInUser,
};