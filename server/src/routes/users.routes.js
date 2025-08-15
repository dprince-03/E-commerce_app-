const express = require('express');
const userRoutes = express.Router();

const { homePage, 
    signUpPage, 
    signUpUser, 
    logInPage, 
    logInUser, 
    adminDashboard, 
    adminDashboardPost, } = require('../controllers/users.controllers');

// user registration page
userRoutes.get('/sign-up', signUpPage);
userRoutes.post('/sign-up', signUpUser);

// user login page
userRoutes.get('/log-in', logInPage);
userRoutes.post('/log-in', logInUser);

//home page route
userRoutes.get('/', homePage);

// Admin dashboard route
userRoutes.get('/admin-dashboard', adminDashboard);
userRoutes.post('/admin-dashboard', adminDashboardPost);

module.exports = userRoutes;