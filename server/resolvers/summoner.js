// resolvers/summoner.js
const { regionMapping } = require('../config/regionMapping');
const {
  getMasteryByPuuid,
  getRankedDataBySummId,
  getSummonerDetails,
  getSummonerDetailsByPuuid,
  recordRecentMatches,
  getChallengeDataByPuuid,
  getChallengeConfig,
  getSummonerTaglineByPuuid,
} = require('../controllers/riot');

const summonerResolvers = {
  Query: {
    summoner: async (_, { region, name }, { models }) => {
      const summoner = await models.Summoner.findOne({
        nameURL: name.toLowerCase(),
        regionURL: region.toLowerCase()
      }).populate('masteryData challengeData.challenges');
      if (!summoner) throw new Error('Summoner not found');
      return summoner;
    },
    summoners: async (_, __, { models }) => {
      return await models.Summoner.find().populate('masteryData challengeData.challenges');
    },
  
  },
  
  Mutation: {
    updateSummoner: async (_, { puuid }, { models, user }) => {

      const summoner = await models.Summoner.findOne({ puuid });
      if (!summoner) {
        throw new UserInputError('Summoner not found');
      }

      try {
        // Get updated summoner data
        await summoner.save();
        return summoner;
      } catch (error) {
        throw new Error(`Failed to update summoner: ${error.message}`);
      }
    },

    updateAllSummoners: async (_, __, { models, user }) => {

      const summoners = await models.Summoner.find();
      const results = await Promise.allSettled(
        summoners.map(async summoner => {
          try {
            console.log(`Updating ${summoner.name}`);
            await summoner.save();
            console.log(`Updated ${summoner.name}`);
            return { status: 'fulfilled' };
          } catch (error) {
            return { status: 'rejected', reason: error.message };
          }
        })
        );

      return summoners;
    }
  }
};

module.exports = summonerResolvers;