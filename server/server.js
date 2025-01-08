const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./resolvers');
const data = require('./controllers/data');
const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const models = require('./models');

// Constants for environment variables and file paths
const DB_CONNECTION = process.env.MONGO_CONNECT;
const PORT = process.env.PORT;
const STATIC_FILES_PATH = path.join(__dirname, "../build");
const ROOT_HTML_FILE = 'index.html';

// Update schema function
const updateSchema = async () => {
  if (mongoose.modelNames().includes('Participant')) {
    delete mongoose.models.Participant;
    models.createParticipantModelFromMemory();
  }
  await data.initializeCache();
};

// Authentication context function
const createContext = async ({ req }) => {
  const token = req.headers['authorization']?.split(' ')[1];
  let user = null;
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      console.error('Invalid token');
    }
  }
  return { user, updateSchema };
};

// Start server function
async function startServer() {
  const app = express();

  // Connect to database
  await connectDB(DB_CONNECTION);

  // Initialize cache and update schema
  await data.initializeCache();
  await updateSchema();

  // Configure Apollo server
  const server = new ApolloServer({
    typeDefs: typeDefs(),
    resolvers,
    context: createContext,
  });

  await server.start();
  server.applyMiddleware({ app });
  console.log("Apollo server started");

  // Serve static files
  app.use(express.static(STATIC_FILES_PATH));
  app.get('/*', (req, res) => {
    res.sendFile(ROOT_HTML_FILE, { root: STATIC_FILES_PATH });
  });

  // Start Express server
  app.listen({ port: PORT }, () =>
      console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startServer().catch((err) => console.error(err));