// resolvers/match.js
const { performance } = require('perf_hooks');
const { parse } = require('graphql');
const { stat } = require('fs');
const Match = require('../models/Match');

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
      tags = [],
      stats = []
    }, { models, data }, info) => {

      let totalTime = performance.now();

      if (stats == null) {
        stats = [];
      }

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
      } else {
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
      let participants = await models.Participant.find(query, { matchId: 1, uniqueId: 1, gameMode:1, abstract: 1, }).sort({ gameStartTimestamp: 'desc' }).limit(limit * summoner.length);
      matchIds = participants.map((participant) => participant.matchId);
      const endP = performance.now();
      console.log(`Participant query took ${(endP - startP)}ms`);
      let matches = [];
      let matchQuery = {};
      if (matchIds.length === 0) {
        return {
          matchData: [],
          statData: {
            stats: {},
            matchCount: 0
          }
        }
      }
      //remove repeated matchIds
      matchIds = [...new Set(matchIds)];
      //limit to the first limit matches
      matchIds = matchIds.slice(0, limit);

      const start = performance.now();
      matchQuery["metadata.matchId"] = { $in: matchIds };
      // Get requested fields from GraphQL query
      const requestedFields = extractFields(info);
      const participantFields = requestedFields.matchData.info.participants;
      const requestedFieldsMatch = new Object(requestedFields.matchData);
      participantFields.uniqueId = 1;
      requestedFieldsMatch.info.participants = 1;

      matches = await models.Match.find(matchQuery).sort({ "info.gameStartTimestamp": 'desc' }).populate('info.participants');
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


      // Extract all participants from matches
      const allParticipants = matches.flatMap(match =>
        match.info.participants.filter(p =>
          participants.some(op => op.uniqueId === p.uniqueId)
        )
      );

      // Calculate stats from filtered participants
      const results = {};
      for (const statRequest of stats) {
        const values = allParticipants
          .filter(p => !p.gameEndedInEarlySurrender)
          .map(participant => {
            let value = participant;
            for (const key of statRequest.path.split('/')) {
              value = value[key];
            }
            return value;
          })
          .filter(value => value !== undefined);

        switch (statRequest.aggregation) {
          case 'AVG':
            results[statRequest.path] = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'MAX':
            results[statRequest.path] = Math.max(...values);
            break;
          case 'MIN':
            results[statRequest.path] = Math.min(...values);
            break;
          case 'MODE':
            results[statRequest.path] = mode(values);
            break;
          case 'SUM':
            results[statRequest.path] = values.reduce((a, b) => a + b, 0);
            break;
          case 'UNIQUE':
            results[statRequest.path] = [...new Set(values)];
            break;
          case 'LIST':
          default:
            results[statRequest.path] = values;
        }
      }

      totalTime = performance.now() - totalTime;
      console.log(`Total time: ${totalTime}ms`);

      return {
        matchData: matches,
        statData: {
          stats: results,
          matchCount: matches.length
        }
      };
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