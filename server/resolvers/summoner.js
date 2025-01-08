// resolvers/summoner.js
const mongoose = require('mongoose');

//third party
const {AuthenticationError} = require("apollo-server-express");
const {validateAndUpdateSummoner} = require("../controllers/summoner");

//resolvers
const summonerResolvers = {
    Query: {
        summoner: async (_, {region, name}) => {
            const summoner = await mongoose.models.Summoner.findOne({
                nameURL: name.toLowerCase(),
                regionURL: region.toLowerCase()
            }).populate('masteryData challengeData.challenges');
            if (!summoner) throw new Error('Summoner not found');
            return summoner;
        },
        summoners: async (_, __) => {
            return mongoose.models.Summoner.find().populate('masteryData challengeData.challenges');
        },

    },

    Mutation: {
        updateAllSummoners: async (_, __, {user}) => {
            if (!user?.admin) throw new AuthenticationError('Admin access required');
            const summoners = await mongoose.models.Summoner.find();
            await Promise.allSettled(
                summoners.map(async summoner => {
                    try {
                        console.log(`Updating ${summoner.name}`);
                        summoner = await validateAndUpdateSummoner(summoner);
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