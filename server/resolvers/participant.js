const debug = require('debug')('app:participants');
const { performance } = require('perf_hooks');
const { calculateTags } = require('../utils/calculateTags');

const participantResolvers = {
    Query: {
      participant: async (_, { id }, { models }) => {
        try {
          return await models.Participant.findById(id);
        } catch (error) {
          debug('Error fetching participant:', error);
          throw new Error(`Failed to fetch participant: ${error.message}`);
        }
      },
 
      participants: async (_, {
        limit = 20,
        timestamp = Date.now(),
        region,
        summonerName,
        role,
        tag,
        championId,
        queueId
      }, { models }) => {
        try {
          const startTime = performance.now();
          debug('Starting participants query with params:', { 
            region, summonerName, role, tag, championId, queueId 
          });

          let summonerQuery = {};
          if (region) summonerQuery.regionURL = region;
          if (summonerName) summonerQuery.nameURL = summonerName;
          
          let summoner = await models.Summoner.find({
            $and: [ summonerQuery ]
          });
          
          let query = {};
          if (queueId) query.queueId = queueId;
          if (championId) query.championId = championId;
          if (role) query.teamPosition = role;
          if (tag) query[`tags.${tag}`] = true;
          
          query.gameStartTimestamp = { $lt: timestamp };
          let puuids = summoner.map((summoner) => summoner.puuid);
          query.puuid = { $in: puuids };
          
          let participants = await models.Participant.find(query)
            .sort({ gameStartTimestamp: 'desc' })
            .limit(limit);

          const endTime = performance.now();
          debug(`Query completed in ${endTime - startTime}ms`);
          
          return participants;
        } catch (error) {
          debug('Error in participants query:', error);
          throw new Error(`Failed to fetch participants: ${error.message}`);
        }
      }
    },
 
    Mutation: {
      formatParticipant: async (_, { id }, { models }) => {
        const startTime = performance.now();
        debug(`Starting formatParticipant for ID: ${id}`);

        try {
          const participant = await models.Participant.findById(id);
          if (!participant) {
            throw new UserInputError('Participant not found');
          }
          
          const tags = await calculateTags(participant, models);
          participant.tags = tags;
          
          await participant.save();

          const endTime = performance.now();
          debug(`Formatted participant ${id} in ${endTime - startTime}ms`);
          
          return participant;
        } catch (error) {
          debug('Error formatting participant:', error);
          throw new Error(`Failed to format participant: ${error.message}`);
        }
      },

      formatAllParticipants: async (_, __, { models }) => {
        const startTime = performance.now();
        debug('Starting batch format of all participants');

        const stats = {
          total: 0,
          success: 0,
          failed: 0,
          errors: []
        };

        try {
          const participants = await models.Participant.find();
          stats.total = participants.length;

          const results = await Promise.allSettled(
            participants.map(async participant => {
              const participantStartTime = performance.now();
              try {
                
                const tags = await calculateTags(participant, models);
                participant.tags = tags;
                
                await participant.save();

                const participantEndTime = performance.now();
                debug(`Processed ${participant.summonerName} in ${participantEndTime - participantStartTime}ms`);
                
                stats.success++;
                return { status: 'fulfilled' };
              } catch (error) {
                stats.failed++;
                stats.errors.push({
                  id: participant._id,
                  error: error.message
                });
                return { status: 'rejected', reason: error.message };
              }
            })
          );

          const endTime = performance.now();
          debug(`Batch processing completed in ${endTime - startTime}ms`);
          debug('Processing stats:', stats);

          return participants;
        } catch (error) {
          debug('Fatal error in batch processing:', error);
          throw new Error(`Failed to format participants: ${error.message}`);
        }
      }
    }
};

module.exports = participantResolvers;
