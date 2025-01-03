// resolvers/match.js

// internal
const { getMatchData, deleteOrphanMatches } = require('../controllers/matches');

// resolvers
const matchResolvers = {
  Query: {
    // returns all matches, filtered by region, summoner names, roles, champion ids, queue ids, tags, and stats. See controllers/matches.js.
    matches: async (_, {
      limit = 10,
      timestamp = Date.now(),
      region,
      summonerNames = [],
      roles = [],
      championIds = [],
      queueIds = [],
      tags = [],
      stats = []
    }, { models, data }, info) => {

      const matchData = await getMatchData(models, info, data, {
        region,
        summonerNames,
        roles,
        championIds,
        queueIds,
        tags,
        timestamp,
        stats,
        limit
      });
      

      return matchData;
    }
  },

  Mutation: {
    // Delete all matches that do not have a corresponding summoner in the database
    deleteOrphanMatches: async (_, __, { models, user, data }) => {
      if (!user?.admin) throw new AuthenticationError('Admin access required');
      return deleteOrphanMatches(models, user, data);
    }
  }
};

module.exports = matchResolvers;