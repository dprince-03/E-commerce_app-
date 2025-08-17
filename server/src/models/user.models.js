const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

/**
 * Address Schema
 * This schema defines the structure of the address subdocument used in the User schema.
 * It includes fields for type, street, city, state, zip code, country, and a flag for default address.
 * The type field can be "home", "office", or "other".
 * The country defaults to "Nigeria".
 * The schema is designed to be used as a subdocument within the User schema.
 * It allows for multiple addresses to be stored for each user.
 * The _id field is set to true to allow for custom IDs for each address.
 * This schema can be extended to include additional fields as needed.
 * It is designed to be flexible and can accommodate various address formats.
 * The address can be used for shipping, billing, or other purposes.
 * The schema is designed to be used in a MongoDB database with Mongoose.
 * It can be easily integrated into an e-commerce application or any other application that requires user addresses.
 * The address schema can be used to store user addresses in a structured way, making it easy
 * to query and manage addresses for each user.
 * It can also be used to validate address data before saving it to the database.
 * This schema can be used in conjunction with the User schema to provide a complete user profile.
 * The address schema can be extended to include additional fields such as phone number, email, or
 * any other relevant information that may be needed for the address.
 */
const addressSchema = new mongoose.Schema({
		type: {
			type: String,
			enum: ["home", "office", "other"],
			default: "home",
		},
		street: {
			type: String,
			required: true,
			trim: true,
		},
		city: {
			type: String,
			required: true,
			trim: true,
		},
		state: {
			type: String,
			required: true,
			trim: true,
		},
		zipCode: {
			type: String,
			required: true,
			trim: true,
		},
		country: {
			type: String,
			required: true,
			trim: true,
			default: "Nigeria",
		},
		isDefault: {
			type: Boolean,
			default: false,
		},
	}, { 
		_id: true, // Use a custom _id for address subdocuments
	}
);


/**
 * User Schema
 * This schema defines the structure of the user document in the MongoDB database.
 * It includes fields for personal information, authentication, and e-commerce specific data.
 * It is designed to be flexible and can accommodate various user roles and statuses.
 * The schema includes validation for required fields, unique constraints, and data types.
 * It also includes virtuals for full name and account locked status.
 * The schema is designed to be used in a MongoDB database with Mongoose.
 * It can be easily integrated into an e-commerce application or any other application that requires user management.
 * The user schema can be used to store user profiles, manage authentication, and handle e-commerce
 * specific data such as cart, wishlist, and purchase history.
 * The schema can be extended to include additional fields as needed.
 * It is designed to be flexible and can accommodate various user roles such as admin, vendor,
 * moderator, and customer.
 * The schema includes fields for security and authentication, such as password reset tokens,
 * email verification tokens, and login tracking.
 * It also includes fields for user preferences, social login, and addresses.
 * The schema is designed to be used in a MongoDB database with Mongoose.
 */
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
	password: {
		type: String,
		required: [true, "Password is required"],
		minLength: 6,
		maxLength: 64,
		select: false, // Exclude password from queries by default
	},

	// pesronal details	
	phoneNumber: {
		type: String,
		required: [true, "Phone number is required"],
		unique: [true, "Phone number must be unique"],
		trim: true,
		validate: {
			validator: function (v) {
				return !v || validator.isMobilePhone(v);
			},
			message: "Please provide a valid phone number",
		},
		// match: [/^\d{14}$/, "Please enter a valid phone number"],
	},
	avatar: {
		type: String,
		default: null,
	},
	dateOfBirth: {
		type: Date,
		validate: {
			validator: function (v) {
				return !v || v < new Date();
			},
			message: "Date of birth cannot be in the future",
		},
	},
	gender: {
		type: String,
		enum: ["male", "female", "Not a rational being"],
		default: "Not a rational being",
	},

	// User Role & Status
	role: {
		type: String,
		enum: ["user", "admin", "vendor", "moderator"],
		default: "user",
		index: true, // Index for faster lookups
	},
	isActive: {
		type: Boolean,
		default: true,
		index: true, // Index for faster lookups
	},
	isEmailVerified: {
		type: Boolean,
		default: false,
	},
	isPhoneVerified: {
		type: Boolean,
		default: false,
	},
	isLocked: {
		type: Boolean,
		default: false,
	},
	dateCreated: {
		type: Date,
		default: Date.now,
	},

	// Addresses
	address: [addressSchema],

	// E-commerce Specific Fields
	wishlist: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},
	],
	cart: [
		{
			product: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
				min: [1, "Quantity must be at least 1"],
				default: 1,
			},
			addedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],

	// Purchase History
	totalPurchases: {
		type: Number,
		default: 0,
		min: 0,
	},
	totalSpent: {
		type: Number,
		default: 0,
		min: 0,
	},
	lastPurchaseDate: {
		type: Date,
		default: null,
	},

	// Customer Tier (for loyalty programs)
	customElements: {
		type: String,
		enum: ["bronze", "silver", "gold", "platinum"],
		default: "bronze",
	},

	// Security & Authentication
	emailVerificationToken: {
		type: String,
		select: false,
	},
	emailVerificationExpires: {
		type: Date,
		select: false,
	},
	passwordResetToken: {
		type: String,
		select: false,
	},
	passwordResetExpires: {
		type: Date,
		select: false,
	},
	passwordChangedAt: {
		type: Date,
		default: null,
	},

	// Login Tracking
	lastLoginAt: {
		type: Date,
	},
	loginAttempts: {
		type: Number,
		default: 0,
		select: false,
	},
	lockUntil: {
		type: Date,
		select: false,
	},

	// Preferences
	preferences: {
		newsletter: {
			type: Boolean,
			default: false,
		},
		smsNotifications: {
			type: Boolean,
			default: false,
		},
		currency: {
			type: String,
			enum: ["NGN", "USD", "EUR", "GBP"],
			default: "NGN",
		},
		language: {
			type: String,
			enum: ["en", "fr", "es", "de"],
			default: "en",
		},
	},

	// Social Login
	socialAccounts: {
		google: {
			id: String,
			email: String,
		},
		facebook: {
			id: String,
			email: String,
		},
		twitter: {
			id: String,
			username: String,
		},
	},
}, {
	timestamps: true, // Automatically manage createdAt and updatedAt fields
	toJSON: {
		virtuals: true,
		transform: function(doc, ret) {
			ret.id = ret._id; // Add id field
			delete ret._id; // Remove _id field
			delete ret.__v; // Remove version key
			delete ret.password; // Exclude password from JSON output
			return ret;
		}
	},
	toObject: {
		virtuals: true,
		transform: function(doc, ret) {
			ret.id = ret._id; // Add id field
			delete ret._id; // Remove _id field
			delete ret.__v; // Remove version key
			delete ret.password; // Exclude password from object output
			return ret;
		}
	},
});


/**
 * * Virtuals
 * * Virtuals are document properties that you can get and set but that do not get persisted to MongoDB.
 * * They are typically used for computed properties or to create relationships between documents.
 * * In this schema, we define virtuals for full name and account locked status.
 * * The fullName virtual concatenates firstName and lastName.
 * * The isLocked virtual checks if the account is locked based on the lockUntil field.
 * * Virtuals can be used to simplify data retrieval and improve performance by avoiding unnecessary database queries.
 * * They can also be used to create more readable and maintainable code by encapsulating logic
 * * that would otherwise be scattered throughout the application.
 * * Virtuals can be used in queries, population, and other Mongoose operations.
 * * They can also be used to create custom getters and setters for document properties.
 * * Virtuals are a powerful feature of Mongoose that can help you create more efficient and
 * * maintainable schemas.
 */
// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * * Indexes
 * * Indexes are used to improve the performance of database queries.
 * * They allow MongoDB to quickly locate documents without scanning the entire collection.
 * * In this schema, we define indexes for fields that are frequently queried or used in lookups.
 * * Indexes can significantly speed up query performance, especially for large collections.
 * * They can also help enforce uniqueness constraints on fields such as userName, email, and phoneNumber.
 * * Indexes can be created on single fields or compound indexes on multiple fields.
 * * They can also be used to create text indexes for full-text search capabilities.
 * * In this schema, we define indexes for userName, email, phoneNumber, dateCreated, lastLoginAt, role, isActive, emailVerificationToken, passwordResetToken, loginAttempts, lockUntil, preferences, socialAccounts, cart, wishlist, address, and other relevant fields.
 * * This allows for efficient querying and retrieval of user documents based on these fields.
 * * Indexes can be created using the createIndex method in Mongoose or by defining them
 * * directly in the schema definition as shown below.
 */
// Indexes for better performance
userSchema.index({ userName: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });
userSchema.index({ dateCreated: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ loginAttempts: 1 });
userSchema.index({ lockUntil: 1 });
userSchema.index({ preferences: 1 });
userSchema.index({ socialAccounts: 1 });
userSchema.index({ 'cart.product': 1 });
userSchema.index({ 'wishlist': 1 });
userSchema.index({ 'address.type': 1 });
userSchema.index({ 'address.isDefault': 1 });
userSchema.index({ 'address.country': 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.state': 1 });
userSchema.index({ 'address.zipCode': 1 });
userSchema.index({ 'address.street': 1 });
userSchema.index({ 'preferences.currency': 1 });
userSchema.index({ 'preferences.language': 1 });
userSchema.index({ 'socialAccounts.google.id': 1 });
userSchema.index({ 'socialAccounts.facebook.id': 1 });
userSchema.index({ 'socialAccounts.twitter.id': 1 });
userSchema.index({ 'socialAccounts.google.email': 1 });
userSchema.index({ 'socialAccounts.facebook.email': 1 });
userSchema.index({ 'socialAccounts.twitter.username': 1 });
userSchema.index({ isLocked: 1 });
userSchema.index({ dateOfBirth: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ wishlist: 1 });

/**
 * * Middleware
 * * Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
 * * They can be used to perform actions before or after a request is processed.
 * * In this schema, we define pre-save middleware to hash the password before saving the user document.
 * * This ensures that the password is securely stored in the database.
 * * Middleware can also be used to perform validation, logging, authentication, and other tasks.
 * * They can be defined as pre or post hooks for specific events such as save, validate, remove, and update.
 */
// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

/**
 * * Instance Methods
 * * Instance methods are methods that can be called on individual documents.
 * * They are used to encapsulate logic that is specific to a single document instance.
 * * In this schema, we define instance methods for checking password correctness,
 * * checking if the password was changed after the JWT was issued, incrementing login attempts,
 * * resetting login attempts, adding/removing items from the cart, and managing the wishlist.
 * * Instance methods can be used to encapsulate business logic that is specific to a single document
 * * and can be called on individual document instances.
 */
// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Instance method to add item to cart
userSchema.methods.addToCart = function(productId, quantity = 1) {
  const existingItem = this.cart.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }
  
  return this.save();
};

// Instance method to remove item from cart
userSchema.methods.removeFromCart = function(productId) {
  this.cart = this.cart.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Instance method to clear cart
userSchema.methods.clearCart = function() {
  this.cart = [];
  return this.save();
};

// Instance method to add to wishlist
userSchema.methods.addToWishlist = function(productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove from wishlist
userSchema.methods.removeFromWishlist = function(productId) {
  this.wishlist = this.wishlist.filter(id => 
    id.toString() !== productId.toString()
  );
  return this.save();
};


/**
 * * Static Methods
 * * Static methods are methods that can be called on the model itself, rather than on individual document instances.
 * * They are used to encapsulate logic that is applicable to the entire collection of documents.
 * * In this schema, we define static methods for finding users by email, finding active users,
 * * and other utility functions that operate on the User collection.
 * * Static methods can be used to encapsulate logic that is applicable to the entire collection of documents
 * * and can be called on the model itself.
 */
// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};


/* * * Export the User model
 * * The User model is exported so that it can be used in other parts of the application.
 * * It can be imported and used to create, read, update, and delete user documents in the MongoDB database.
 * * The model can also be used to perform queries, validations, and other operations on user documents.
 */
const user = mongoose.model('User', userSchema);
module.exports = user;