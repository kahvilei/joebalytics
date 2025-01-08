// resolvers/match.js

// internal
const {getMatchData, deleteOrphanMatches} = require('../controllers/matches');

// third party
const {AuthenticationError} = require("apollo-server-express");

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
        }, {models}, info) => {

            return await getMatchData(info, {
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
        }
    },

    Mutation: {
        // Delete all matches that do not have a corresponding summoner in the database
        deleteOrphanMatches: async (_, __, {user, data}) => {
            if (!user?.admin) throw new AuthenticationError('Admin access required');
            return deleteOrphanMatches(user, data);
        }
    }
};

module.exports = matchResolvers;