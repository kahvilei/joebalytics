const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

const userResolvers = {
  Query: {
    me: async (_, __, { user, models }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return await models.User.findById(user.id);
    }
  },

  Mutation: {
    register: async (_, { username, password }, { models }) => {
      const existingUser = await models.User.findOne({ 
        username: username.toLowerCase() 
      });
      if (existingUser) throw new UserInputError('Username already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        username: username.toLowerCase(),
        password: hashedPassword
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { token: `Bearer ${token}`, message: 'Registration successful' };
    },

    login: async (_, { username, password }, { models }) => {
      const user = await models.User.findOne({ 
        username: username.toLowerCase() 
      });
      if (!user) throw new UserInputError('User not found');

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new AuthenticationError('Invalid password');

      const token = jwt.sign(
        { id: user.id, username: user.username, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { token: `Bearer ${token}`, message: 'Login successful' };
    }
  }
};

module.exports = userResolvers;