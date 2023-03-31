const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })


// routes
const summoners = require('./routes/summoners');
const matches = require('./routes/matches');
const masteries = require('./routes/masteries');
const challenges = require('./routes/challenges');
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
app.use('/api/masteries', masteries);
app.use('/api/challenges', challenges);
app.use('/api/user', user);

app.use(express.static(path.join(__dirname, "../build")));
app.get('/*', (req, res) => {
  res.sendFile('index.html', {root: 'build'});
 });


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));