// const mongoose = require('mongoose');
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
        if (!hashedPassword) {
            res.status(500).send("Error hashing password");
            return;
        }
        console.log("Hashed Password:", hashedPassword);
    
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
        console.log(`New User Created: ${newUser}`);

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

    if ((!req.body.email || !req.body.userName) || !req.body.password) {
        res.status(400).send("Email and password are required");
        return;
    }

    const userlogInDetails = await user.findOne((!req.body.email || !req.body.userName));

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
    homePage,
    adminDashboard,
    adminDashboardPost,
    signUpPage,
    signUpUser,
    logInPage,
    logInUser,
};