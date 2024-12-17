// resolvers/match.js
const { performance } = require('perf_hooks');
const matchResolvers = {
    Query: {
      match: async (_, { id }, { models }) => {
        return await models.Match.findById(id).populate('info.participants');
      },
  
      matches: async (_, { 
        limit = 10, 
        timestamp = Date.now(), 
        region,
        summonerNames = [],
        roles = [],
        championIds = [],
        queueIds = [],
        tags = []
      }, { models, data }) => {

        let totalTime = performance.now();

        let collectingSumms = performance.now();

        let summonerQuery = {};
        if (region) {
          summonerQuery.regionURL = region;
        }
        if (summonerNames.length > 0) {
          summonerQuery.nameURL = { $in: summonerNames };
        }

        let summoner = [];
        if (Object.keys(summonerQuery).length > 0) {
          //grab only the summoners that are needed from server data
          summoner = data.summoners.filter(summoner => summonerNames.includes(summoner.nameURL));
        }else {
          //get summoners from cached server data (data.summoners)
          summoner = data.summoners;
        }

        let collectingSummsEnd = performance.now();
        console.log(`Collecting summoners took ${(collectingSummsEnd - collectingSumms)}ms`);

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
          query['$or'] = tags.map(tag => ({ [`tags.${tag}.isTriggered`]: true }));
        }
        query.gameStartTimestamp = { $lt: timestamp };
        let puuids = summoner.map((summoner) => summoner.puuid);
        if (puuids.length > 0) {
          query.puuid = { $in: puuids };
        }

        let isParticipantSearch = Object.keys(query).length > 2;

        let matchIds = [];
        if (Object.keys(query).length > 2) {
          const start = performance.now();
          let participants = await models.Participant.find(query).sort({ gameStartTimestamp: 'desc' }).limit(limit*summoner.length);
          matchIds = participants.map((participant) => participant.matchId);
          const end = performance.now();
          console.log(`Participant query took ${(end - start)}ms`);
        }
        let matches = [];

        let matchQuery = {};
        if (isParticipantSearch) {
          if(matchIds.length === 0) {
            return [];
          }
          const start = performance.now();
          matchQuery["metadata.matchId"] = { $in: matchIds };
          matches = await models.Match.find(matchQuery).sort({ "info.gameStartTimestamp": 'desc' }).limit(limit).populate('info.participants');
          const end = performance.now();
          console.log(`Match query took ${(end - start)}ms`);
        }
        if (queueIds.length > 0) {
          matchQuery["info.queueId"] = { $in: queueIds };
        }
        if (matches.length === 0) {
          matchQuery["info.gameStartTimestamp"] = { $lt: timestamp };
          // start second timer to debug time taken to query
          const start = performance.now();
          matches = await models.Match.find(matchQuery).sort({ "info.gameStartTimestamp": 'desc' }).limit(limit).populate('info.participants');
          const end = performance.now();
          console.log(`Query took ${(end - start)}ms`);

        }
       
        //convert MongooseMaps within matches to plain objects
        const objectMakeStart = performance.now();
        matches = matches.map(match => {
          let newMatch = match.toObject();
          newMatch.info.participants = newMatch.info.participants.map(participant => {
            let newParticipant = participant
            if(newParticipant.challenges) {
            newParticipant.challenges = Object.fromEntries(newParticipant.challenges);
            }
            if (newParticipant.tags) {
              newParticipant.tags = Object.fromEntries(newParticipant.tags);
            }
            return newParticipant;
          }
          );
          return newMatch;
        });
        const objectMakeEnd = performance.now();
        console.log(`Object make took ${(objectMakeEnd - objectMakeStart)}ms`);
        let totalEnd = performance.now();
        console.log(`Total time taken ${(totalEnd - totalTime)}ms`);

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