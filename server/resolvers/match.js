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
        const query = {};
        if (region && summonerName) {
          const summoner = await models.Summoner.findOne({
            nameURL: summonerName.toLowerCase(),
            regionURL: region.toLowerCase()
          });
          if (summoner) query['metadata.participants'] = summoner.puuid;
        }
        if (role) query['info.participants.teamPosition'] = role;
        if (championId) query['info.participants.championId'] = championId;
        if (queueId) query['info.queueId'] = queueId;
        query['info.gameStartTimestamp'] = { $lt: timestamp };
  
        return await models.Match.find(query)
          .sort({ 'info.gameStartTimestamp': -1 })
          .limit(limit)
          .populate('info.participants');
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