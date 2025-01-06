// resolvers/index.js

//internal
const userResolvers = require('./user');
const summonerResolvers = require('./summoner');
const matchResolvers = require('./match');
const masteryResolvers = require('./mastery');
const challengeResolvers = require('./challenge');
const dataResolvers = require('./data');
const participantResolvers = require('./participant');
const {GraphQLJSON} = require('graphql-type-json');

module.exports = {
    JSON: GraphQLJSON,
    Query: {
        ...userResolvers.Query,
        ...summonerResolvers.Query,
        ...matchResolvers.Query,
        ...masteryResolvers.Query,
        ...challengeResolvers.Query,
        ...dataResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...summonerResolvers.Mutation,
        ...matchResolvers.Mutation,
        ...dataResolvers.Mutation,
        ...participantResolvers.Mutation
    }
};
