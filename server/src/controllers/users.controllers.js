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
const getAllUsers = (req, res) => {
    user.find({}, (err, users) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Error fetching users",
                error: err.message,
            });
        }
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    });
};



module.exports = {
    homePage,
    adminDashboard,
    adminDashboardPost: {
        getAllUsers,
    }
};