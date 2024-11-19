// resolvers/index.js
const userResolvers = require('./user');
const summonerResolvers = require('./summoner');
const matchResolvers = require('./match');
const masteryResolvers = require('./mastery');
const challengeResolvers = require('./challenge');
const dataResolvers = require('./data');
const statsResolvers = require('./stats');
const { GraphQLJSON } = require('graphql-type-json');

module.exports = {
  JSON: GraphQLJSON,
  Query: {
    ...userResolvers.Query,
    ...summonerResolvers.Query,
    ...matchResolvers.Query,
    ...masteryResolvers.Query,
    ...challengeResolvers.Query,
    ...dataResolvers.Query,
    ...statsResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...summonerResolvers.Mutation,
    ...matchResolvers.Mutation,
    ...masteryResolvers.Mutation,
    ...challengeResolvers.Mutation,
    ...dataResolvers.Mutation
  }
};
