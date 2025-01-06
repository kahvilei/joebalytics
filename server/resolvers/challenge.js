// resolvers/challenge.js

const challengeResolvers = {
    Query: {
        // returns all challenges, sorted by percentile by default. Can be filtered by puuid.
        challenges: async (_, {
            limit,
            puuid,
            sortBy = {field: 'PERCENTILE', direction: 'DESC'}
        }, {models}) => {
            const sort = {};
            sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;

            const query = puuid ? {puuid} : {};
            return models.Challenge.find(query).sort(sort).limit(limit);
        }
    }
};

module.exports = challengeResolvers;