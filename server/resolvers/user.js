// resolvers/user.js

//third party
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {AuthenticationError, UserInputError} = require('apollo-server-express');
const mongoose = require('mongoose');

const userResolvers = {
    Query: {
        me: async (_, __, {user}) => {
            if (!user) throw new AuthenticationError('Not authenticated');
            return mongoose.models.User.findById(user.id);
        }
    },

    Mutation: {
        register: async (_, {username, password}) => {
            const existingUser = await mongoose.models.User.findOne({
                username: username.toLowerCase()
            });
            if (existingUser) throw new UserInputError('Username already exists');

            const hashedPassword = await bcrypt.hash(password, 10);

            let user = {};
            user.admin = undefined;
            user.username = undefined;
            user.id = undefined;

            user = await mongoose.models.User.create({
                username: username.toLowerCase(),
                password: hashedPassword
            });

            if (!user) throw new UserInputError('Registration failed');

            const token = jwt.sign(
                {id: user.id, username: user.username, admin: user.admin},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            );

            return {token: `Bearer ${token}`, message: 'Registration successful', user};
        },

        login: async (_, {username, password}) => {
            const user = await mongoose.models.User.findOne({
                username: username.toLowerCase()
            });
            if (!user) throw new UserInputError('User not found');

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) throw new AuthenticationError('Invalid password');

            const token = jwt.sign(
                {id: user.id, username: user.username, admin: user.admin},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            );

            return {token: `Bearer ${token}`, message: 'Login successful', user};
        }
    }
};

module.exports = userResolvers;