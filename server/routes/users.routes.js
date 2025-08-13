const express = require('express');
const userRoutes = express.Router();

userRoutes.get('/', (req,res) => {
    res.send('User Home Page')
    res.status(200);
});

module.exports = userRoutes;