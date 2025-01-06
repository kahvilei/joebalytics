// resolvers/summoner.js
const {AuthenticationError} = require("apollo-server-express");
const summonerResolvers = {
    Query: {
        summoner: async (_, {region, name}, {models}) => {
            const summoner = await models.Summoner.findOne({
                nameURL: name.toLowerCase(),
                regionURL: region.toLowerCase()
            }).populate('masteryData challengeData.challenges');
            if (!summoner) throw new Error('Summoner not found');
            return summoner;
        },
        summoners: async (_, __, {models}) => {
            return models.Summoner.find().populate('masteryData challengeData.challenges');
        },

    },

    Mutation: {
        updateAllSummoners: async (_, __, {models, user}) => {
            if (!user?.admin) throw new AuthenticationError('Admin access required');
            const summoners = await models.Summoner.find();
            await Promise.allSettled(
                summoners.map(async summoner => {
                    try {
                        console.log(`Updating ${summoner.name}`);
                        await summoner.save();
                        console.log(`Updated ${summoner.name}`);
                        return {status: 'fulfilled'};
                    } catch (error) {
                        return {status: 'rejected', reason: error.message};
                    }
                })
            );
            return summoners;
        }
    }
};

module.exports = summonerResolvers;