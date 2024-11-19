const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const resolvers = {
  Query: {
    summoner: async (_, { region, name }, { models }) => {
      const summoner = await models.Summoner.findOne({
        nameURL: name.toLowerCase(),
        regionURL: region.toLowerCase()
      }).populate('masteryData challengeData.challenges');
      if (!summoner) throw new Error('Summoner not found');
      return summoner;
    },

    summoners: async (_, __, { models }) => {
      return await models.Summoner.find().populate('masteryData challengeData.challenges');
    },

    matches: async (_, { limit = 20, timestamp = Date.now(), region, summonerName, role, championId, queueId }, { models }) => {
      let query = {};
      
      if (region && summonerName) {
        const summoner = await models.Summoner.findOne({
          nameURL: summonerName.toLowerCase(),
          regionURL: region.toLowerCase()
        });
        if (summoner) {
          query['metadata.participants'] = summoner.puuid;
        }
      }

      if (role) query['info.participants.teamPosition'] = role;
      if (championId) query['info.participants.championId'] = championId;
      if (queueId) query['info.queueId'] = queueId;
      query['info.gameStartTimestamp'] = { $lt: timestamp };

      return await models.Match.find(query)
        .sort({ 'info.gameStartTimestamp': -1 })
        .limit(limit)
        .populate('info.participants');
    },

    masteries: async (_, { limit, championId, sortBy }, { models }) => {
      let query = {};
      if (championId) query.championId = championId;

      let sort = {};
      if (sortBy) {
        sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;
      } else {
        sort = { championPoints: -1 };
      }

      return await models.Mastery.find(query)
        .sort(sort)
        .limit(limit);
    },

    challenges: async (_, { limit, sortBy }, { models }) => {
      let sort = {};
      if (sortBy) {
        sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;
      } else {
        sort = { percentile: -1 };
      }

      return await models.Challenge.find()
        .sort(sort)
        .limit(limit);
    }
  },

  Mutation: {
    registerUser: async (_, { username, password }, { models }) => {
      const existingUser = await models.User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        throw new UserInputError('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        username: username.toLowerCase(),
        password: hashedPassword
      });

      const token = jwt.sign(
        { id: user._id, username: user.username, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token: `Bearer ${token}`,
        message: 'User registered successfully'
      };
    },

    loginUser: async (_, { username, password }, { models }) => {
      const user = await models.User.findOne({ username: username.toLowerCase() });
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new AuthenticationError('Invalid password');
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token: `Bearer ${token}`,
        message: 'Login successful'
      };
    },

    addSummoner: async (_, { region, name }, { models, user }) => {
      if (!user?.admin) {
        throw new AuthenticationError('Admin access required');
      }

      const summoner = await models.Summoner.create({
        regionDisplay: region,
        name: name
      });

      return summoner;
    }
  },

  Summoner: {
    matches: async (parent, { limit = 20, queueId }, { models }) => {
      let query = { 'metadata.participants': parent.puuid };
      if (queueId) query['info.queueId'] = queueId;

      return await models.Match.find(query)
        .sort({ 'info.gameStartTimestamp': -1 })
        .limit(limit)
        .populate('info.participants');
    }
  },

  Mastery: {
    summoner: async (parent, _, { models }) => {
      return await models.Summoner.findOne({ puuid: parent.puuid });
    }
  },

  Challenge: {
    summoner: async (parent, _, { models }) => {
      return await models.Summoner.findOne({ puuid: parent.puuid });
    }
  }
};

module.exports = resolvers;
