// resolvers/match.js
const matchResolvers = {
    Query: {
      match: async (_, { id }, { models }) => {
        return await models.Match.findById(id).populate('info.participants');
      },
  
      matches: async (_, { 
        limit = 20, 
        timestamp = Date.now(), 
        region,
        summonerNames = [],
        roles = [],
        championIds = [],
        queueIds = [],
        tags = []
      }, { models }) => {

        let summonerQuery = {};
        if (region) {
          summonerQuery.regionURL = region;
        }
        if (summonerNames.length > 0) {
          summonerQuery.nameURL = { $in: summonerNames };
        }

        let summoner = [];
        if (Object.keys(summonerQuery).length > 0) {
          summoner = await models.Summoner.find({
            $and: [ summonerQuery ]
          });
        }else {
          summoner = await models.Summoner.find();
        }

        let query = {};
        if (queueIds.length > 0) {
          query.queueId = { $in: queueIds };
        }
        if (championIds.length > 0) {
          query.championId = { $in: championIds };
        }
        if (roles.length > 0) {
          query.teamPosition = { $in: roles };
        }
        if (tags.length > 0) {
          tags.forEach(tag => {
            query[`tags.${tag}.isTriggered`] = true;
          });
        }

        let isParticipantSearch = summoner.length > 0 || Object.keys(query).length > 0;

        let matchIds = [];
        if (summoner.length > 0 || Object.keys(query).length > 0) {
          query.gameStartTimestamp = { $lt: timestamp };
          let puuids = summoner.map((summoner) => summoner.puuid);
          if (puuids.length > 0) {
            query.puuid = { $in: puuids };
          }

          let participants = await models.Participant.find(query).sort({ gameStartTimestamp: 'desc' }).limit(limit);
          matchIds = participants.map((participant) => participant.matchId);
        }

        let matchQuery = {};
        if (isParticipantSearch) {
          matchQuery["metadata.matchId"] = { $in: matchIds };
          return await models.Match.find(matchQuery).sort({ "info.gameStartTimestamp": 'desc' }).populate('info.participants');
        }
        if (queueIds.length > 0) {
          matchQuery["info.queueId"] = { $in: queueIds };
        }
        matchQuery["info.gameStartTimestamp"] = { $lt: timestamp };

        let matches = await models.Match.find(matchQuery).sort({ "info.gameStartTimestamp": 'desc' }).limit(limit).populate('info.participants');

        return matches;
      }
    },
  
    Mutation: {
      deleteOrphanMatches: async (_, __, { models, user }) => {
        if (!user?.admin) throw new AuthenticationError('Admin access required');
  
        try {
          const summoners = await models.Summoner.find();
          const puuids = summoners.map(s => s.puuid);
          const result = await models.Match.deleteMany({
            "metadata.participants": { $nin: puuids }
          });
  
          return {
            message: `Deleted ${result.deletedCount} orphan matches`,
            success: true
          };
        } catch (error) {
          throw new Error(`Failed to delete orphan matches: ${error.message}`);
        }
      }
    }
  };

module.exports = matchResolvers;