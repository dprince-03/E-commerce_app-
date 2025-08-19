// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const user = require('../models/user.models');

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Own Profile
const getuser = async (req, res) => {
    const userId = req.params.id;
    try {
		const userDetails = await user.findById(userId);
		if (!userDetails) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		
        // Check if user is accessing their own profile or is admin
        if (req.user.id !== user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }

        res.status(200).json({
			success: true,
			data: {
				userDetails,
			},
		});

	} catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message,
        });
    }
};

// Admin dashboard route
const adminDashboard = (req, res) => {
    res.send('Admin Dashboard');
    res.status(200);
};
// @desc    Get all users (Admin only)
// @route   GET
// @access  Private/Admin
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
    getuser,
    adminDashboard,
    adminDashboardPost: {
        getAllUsers,
    }
};