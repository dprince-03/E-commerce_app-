const mongoose = require('mongoose');

const MONGODB_URL = require('dotenv').config().parsed.MONGODB_URL;

mongoose.set('strictQuery', false);

const DB_URL = process.env.MONGODB_URL || MONGODB_URL;

if (!DB_URL) {
	throw new Error(
		"please define DB_URI environment variable inside .env file",
	);
}

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(DB_URL );
        console.log(
            `Database connected: ${connect.connection.host}\n`,
            `Database name: ${connect.connection.name}`,
        );
    } catch (error) {
        console.error('Error connecting to database: ', error);
        process.exit(1);
    }
};

console.log(`Done setting up database connection.`);


module.exports = connectDB;