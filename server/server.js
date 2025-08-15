require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./src/config/db.config');
const userRoutes = require('./src/routes/users.routes');

connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `https://localhost:${PORT}`,
    credentials: true,
}));
app.use(morgan('combined'));

app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});