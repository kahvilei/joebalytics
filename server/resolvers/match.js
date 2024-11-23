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
        summonerName,
        role,
        championId,
        queueId
      }, { models }) => {

        let summonerQuery = {}
        if (region) {
          summonerQuery.regionURL = region;
        }
        if (summonerName) {
          summonerQuery.nameURL = summonerName;
        }

        let summoner = await models.Summoner.find({
          $and: [ summonerQuery ]
        });

        let query  = {};

        if (queueId) {
          query.queueId = queueId;
        }

        if (championId) {
          query.championId = championId;
        }

        if (role) {
          query.teamPosition = role;
        }

        query.gameStartTimestamp = { $lt: timestamp };

        let puuids = summoner.map((summoner) => summoner.puuid);

        query.puuid = { $in: puuids };

        let participants = await models.Participant.find(query).sort({ gameStartTimestamp: 'desc' }).limit(limit);

        let matchIds = participants.map((participant) => participant.matchId);

        let matches = await models.Match.find({ "metadata.matchId": { $in: matchIds }}).sort({ "info.gameStartTimestamp": 'desc' }).limit(limit).populate('info.participants')
  
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