const path = require('path');
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

// app.use(express.static(path.join(__dirname, "../build")));
// app.get('/', (req, res) => {
//   const indexFile = path.resolve('../build/index.html');
//   res.sendFile(indexFile);
// });


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));