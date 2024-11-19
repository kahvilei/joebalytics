const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const models = require('./models');
const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function startServer() {
  // Connect Database
  const db = process.env.MONGO_CONNECT;
  connectDB(db);
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Add auth context
      const token = req.headers['authorization']?.split(' ')[1];
      let user = null;
      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
          console.error('Invalid token');
        }
      }
      return { models, user };
    }
  });

  await server.start();
  
  const app = express();
  server.applyMiddleware({ app });

  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
  );
}

startServer();