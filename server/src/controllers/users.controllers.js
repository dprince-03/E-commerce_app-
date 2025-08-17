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



module.exports = {
    homePage,
    adminDashboard,
    adminDashboardPost,
};