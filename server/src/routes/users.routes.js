const express = require('express');
const multer = require('multer');
const userRoutes = express.Router();

const { 
    homePage, 
    adminDashboard, 
    adminDashboardPost, 
} = require('../controllers/users.controllers');


// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
}
});

// Apply authentication to all routes after this middleware
// router.use(protect);

// Current user routes
router.get('/me', userController.getMe);
router.patch('/me', validateUserUpdate, userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin only routes
// router.use(restrictTo('admin'));

// User management routes (Admin only)
router.get('/stats', userController.getUserStats);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', validateUserUpdate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = userRoutes;