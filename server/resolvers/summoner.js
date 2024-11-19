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
      if (!user?.admin) {
        throw new AuthenticationError('Admin access required');
      }

      const summoner = await models.Summoner.findOne({ puuid });
      if (!summoner) {
        throw new UserInputError('Summoner not found');
      }

      try {
        // Get updated summoner data
        const summonerResponse = await getSummonerDetailsByPuuid(
          summoner.puuid, 
          summoner.regionServer
        );
        const taglineResponse = await getSummonerTaglineByPuuid(
          summoner.puuid,
          summoner.regionGeo
        );

        if (summonerResponse.status !== 200 || taglineResponse.status !== 200) {
          throw new Error('Failed to fetch summoner data from Riot API');
        }

        // Update basic info
        summoner.name = taglineResponse.data.gameName;
        summoner.tagline = taglineResponse.data.tagLine;
        summoner.profileIconId = summonerResponse.data.profileIconId;
        summoner.revisionDate = summonerResponse.data.revisionDate;
        summoner.summonerLevel = summonerResponse.data.summonerLevel;
        summoner.lastUpdated = Date.now();
        summoner.nameURL = `${summoner.name.toLowerCase()}-${summoner.tagline.toLowerCase()}`;

        // Update matches
        await recordRecentMatches(summoner.puuid, summoner.regionGeo, false);

        // Update challenges
        await models.Challenge.deleteMany({ puuid: summoner.puuid });
        const challengeData = await getChallengeDataByPuuid(
          summoner.puuid,
          summoner.regionServer
        );
        const challengeConfig = await getChallengeConfig();

        const challenges = await Promise.all(
          challengeData.data.challenges.map(async (challenge) => {
            const config = challengeConfig.data.find(
              (c) => c.id === challenge.challengeId
            );
            
            if (!config) return null;

            return models.Challenge.create({
              uniqueId: `${summoner.puuid}-${challenge.challengeId}`,
              puuid: summoner.puuid,
              profileIconId: summoner.profileIconId,
              summonerName: summoner.name,
              challengeId: challenge.challengeId,
              challengeName: config.localizedNames.en_US.name,
              shortDesc: config.localizedNames.en_US.shortDescription,
              percentile: challenge.percentile,
              level: challenge.level,
              value: challenge.value,
              achievedTime: challenge.achievedTime
            });
          })
        );

        summoner.challengeData = {
          totalPoints: challengeData.data.totalPoints,
          categoryPoints: challengeData.data.categoryPoints,
          challenges: challenges.filter(c => c !== null).map(c => c._id),
          preferences: challengeData.data.preferences
        };

        // Update masteries
        await models.Mastery.deleteMany({ puuid: summoner.puuid });
        const masteryData = await getMasteryByPuuid(
          summoner.puuid,
          summoner.regionServer
        );

        const masteries = await Promise.all(
          masteryData.data.map(async (mastery) => {
            const participants = await models.Participant.find({
              puuid: summoner.puuid,
              championId: mastery.championId
            });

            const wins = participants.filter(p => p.win).length;
            const winRate = participants.length > 0 ? wins / participants.length : null;

            return models.Mastery.create({
              uniqueId: `${summoner.puuid}-${mastery.championId}`,
              championId: mastery.championId,
              championLevel: mastery.championLevel,
              championPoints: mastery.championPoints,
              lastPlayTime: mastery.lastPlayTime,
              championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
              championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
              chestGranted: mastery.chestGranted,
              tokensEarned: mastery.tokensEarned,
              summonerId: summoner.id,
              puuid: summoner.puuid,
              profileIconId: summoner.profileIconId,
              summonerName: summoner.name,
              winRate: winRate,
              gamesPlayed: participants.length
            });
          })
        );

        summoner.masteryData = masteries.map(m => m._id);

        // Update ranked data
        const rankedData = await getRankedDataBySummId(
          summoner.id,
          summoner.regionServer
        );
        if (rankedData.status === 200) {
          summoner.rankedData = rankedData.data;
        }

        await summoner.save();
        
        return summoner;
      } catch (error) {
        throw new Error(`Failed to update summoner: ${error.message}`);
      }
    },

    updateAllSummoners: async (_, __, { models, user }) => {
      if (!user?.admin) {
        throw new AuthenticationError('Admin access required');
      }

      const summoners = await models.Summoner.find();
      const results = await Promise.allSettled(
        summoners.map(summoner => 
          summonerResolvers.Mutation.updateSummoner(null, { puuid: summoner.puuid }, { models, user })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        message: `Updated ${succeeded} summoners, ${failed} failed`,
        success: failed === 0
      };
    }
  }
};

module.exports = summonerResolvers;