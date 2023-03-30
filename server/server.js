import path from 'path';
import fs from 'fs';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";
import express from 'express';

import App from '../src/App';


const connectDB = require('./config/db');
const cors = require('cors');
const app = express();

// routes
const summoners = require('./routes/summoners');
const matches = require('./routes/matches');
const user = require('./routes/user');

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

// Connect Database
connectDB();
// cors
app.use(cors({ origin: true, credentials: true }));

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.static(path.join(__dirname, "../build")));


// use Routes
app.use('/api/summoners', summoners);
app.use('/api/matches', matches);
app.use('/api/user', user);


app.get('/*', (req, res) => {
  const context = {};
  const app = ReactDOMServer.renderToString(<StaticRouter location={req.url} context={context}><App /></StaticRouter>);
  const indexFile = path.resolve('../build/index.html');

  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Oops, better luck next time!');
    }

    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    );

  });
  if (context.url) {
    res.writeHead(301, {
      Location: context.url
    });
    res.end();
  } else {
    res.write(`
    <!doctype html>
    <div id="app">${app}</div>
  `);
    res.end();
  }
});


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));