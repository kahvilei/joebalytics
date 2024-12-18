// resolvers/match.js
const { performance } = require('perf_hooks');
const { parse } = require('graphql');

const getRequestedFields = (selectionSet) => {
  const fields = {};

  selectionSet.selections.forEach((selection) => {
    if (selection.selectionSet) {
      fields[selection.name.value] = getRequestedFields(selection.selectionSet);
    } else {
      fields[selection.name.value] = 1;
    }
  });

  return fields;
};

const extractFields = (info) => {
  return getRequestedFields(info.fieldNodes[0].selectionSet);
};
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
      }, { models, data }, info) => {

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

        let matchIds = [];
        const startP = performance.now();
        let participants = await models.Participant.find(query, { matchId:1, abstract:1, } ).sort({ gameStartTimestamp: 'desc' }).limit(limit*summoner.length);
        matchIds = participants.map((participant) => participant.matchId);
        const endP = performance.now();
        console.log(`Participant query took ${(endP - startP)}ms`);
        let matches = [];
        let matchQuery = {};
          if(matchIds.length === 0) {
            return [];
          }
        //remove repeated matchIds
        matchIds = [...new Set(matchIds)];
        //limit to the first limit matches
        matchIds = matchIds.slice(0, limit);

        const start = performance.now();
        matchQuery["metadata.matchId"] = { $in: matchIds };
        // Get requested fields from GraphQL query
        const requestedFields = extractFields(info);
        const participantFields = requestedFields.info.participants;
        const requestedFieldsMatch = new Object(requestedFields);
        requestedFieldsMatch.info.participants = 1;

        matches = await models.Match.find(matchQuery, requestedFields).sort({ "info.gameStartTimestamp": 'desc' }).populate('info.participants', participantFields);
        const end = performance.now();
        console.log(`Match query took ${(end - start)}ms`);

        matches = matches.map(match => {
          let newMatch = match.toObject();
          newMatch.info.participants = newMatch.info.participants.map(participant => {
            let newParticipant = participant;
            if (newParticipant.challenges) {
              newParticipant.challenges = Object.fromEntries(participant.challenges);
            }
            if (newParticipant.tags) {
              newParticipant.tags = Object.fromEntries(participant.tags);
            }
            return newParticipant;
          });
          return newMatch;
        });
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