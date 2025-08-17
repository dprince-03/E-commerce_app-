const express = require('express');
const rateLimit = require('express-rate-limit');
const {
    signUpPage, 
    signUpUser, 
    logInPage, 
    logInUser, 
} = require('../controllers/auth.controllers');