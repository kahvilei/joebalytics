// app.js
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();

// routes
const summoners = require('./routes/summoners');
const matches = require('./routes/matches');
const user = require('./routes/user');


// Connect Database
connectDB();
// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json({ extended: false }));

// use Routes
app.use('/api/summoners', summoners);
app.use('/api/matches', matches);
app.use('/api/user', user);

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));