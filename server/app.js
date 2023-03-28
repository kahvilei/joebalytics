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

const environment = process.env.ENVIRONMENT;

let ENVIRONMENT_VARIABLES = {
    'process.env.ENVIRONMENT': JSON.stringify('development'),
    'process.env.PORT': JSON.stringify('3080'),
    'process.env.MONGO_CONNECTION_STRING': JSON.stringify('mongodb://mongo-db:27017')
  };
  
  if (environment === 'test') {
    ENVIRONMENT_VARIABLES = {
      'process.env.ENVIRONMENT': JSON.stringify('test'),
      'process.env.PORT': JSON.stringify('3080'),
      'process.env.MONGO_CONNECTION_STRING': JSON.stringify('mongodb://mongo-db:27017')
    };
  } else if (environment === 'production') {
    ENVIRONMENT_VARIABLES = {
      'process.env.ENVIRONMENT': JSON.stringify('production'),
      'process.env.PORT': JSON.stringify('80'),
      'process.env.MONGO_CONNECTION_STRING': JSON.stringify('mongodb+srv://admin123:admin123@todo-cluster.zpikr.mongodb.net/?retryWrites=true&w=majority')
    };
  }


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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "./frontend/build/index.html"));
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));