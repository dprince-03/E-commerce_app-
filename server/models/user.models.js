const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	userName: {
		type: String,
		required: [true, "User name is required"],
		unique: true,
		trim: true,
		minLength: 3,
		maxLength: 21,
	},
	firstName: {
		type: String,
		required: [true, "First name is required"],
		trim: true,
		minLength: 3,
		maxLength: 21,
	},
	lastName: {
		type: String,
		required: [true, "Last name is required"],
		trim: true,
		minLength: 3,
		maxLength: 21,
	},
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: [true, "Email must be unique"],
		trim: true,
		lowercase: true,
		minLength: 10,
		maxLength: 50,
		match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
	},
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        unique: [true, "Phone number must be unique"],
        trim: true,
        match: [/^\d{14}$/, "Please enter a valid phone number"],
    },
	password: {
		type: String,
		required: [true, "Password is required"],
		minLength: 6,
		maxLength: 64,
	},
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

const user = mongoose.model('UserDB', userSchema);

module.exports = user;