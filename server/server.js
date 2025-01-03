const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const models = require('./models');
const { initializeData } = require('./controllers/data');

const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose');

async function startServer() {
  const app = express();
  let server;

  const updateSchema = async () => {
    // Remove from both mongoose registries
    if (mongoose.modelNames().includes('Participant')) {
      delete mongoose.models.Participant;
    }  
    // Create and start new server with updated schema
    await createNewServer();
  }
  
  const createNewServer = async () => {
    // Connect Database
    const db = process.env.MONGO_CONNECT;
    connectDB(db);
    models.Participant = await models.participantFunctions.createParticipantModel();

    const data = {}
    await initializeData(data);

    data.summoners = await models.Summoner.find();
    
    // Create new server instance
    server = new ApolloServer({
      typeDefs: await typeDefs(),
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
        return { models, user, updateSchema, data };
      }
    });

    await server.start();
    server.applyMiddleware({ app });

    console.log("Apollo server started");
  };

  await createNewServer();

  app.listen({ port: process.env.PORT }, () =>
    console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`)
  );

  app.use(express.static(path.join(__dirname, "../build")));

  app.get('/*', (req, res) => {
    res.sendFile('index.html', {root: 'build'});
  });

}

startServer();