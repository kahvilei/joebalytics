// resolvers/mastery.js
const mongoose = require('mongoose');
// resolvers
const masteryResolvers = {
    Query: {
        // returns all masteries, sorted by champion points by default. Can be filtered by championId or puuid.
        masteries: async (_, {
            limit,
            championId,
            puuid,
            sortBy = {field: 'CHAMPION_POINTS', direction: 'DESC'}
        }) => {
            const query = {};
            if (championId) query.championId = championId;
            if (puuid) query.puuid = puuid;
            const sort = {};
            sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;

            return mongoose.models.Mastery.find(query)
                .sort(sort)
                .limit(limit);
        }
    }
};

module.exports = masteryResolvers;