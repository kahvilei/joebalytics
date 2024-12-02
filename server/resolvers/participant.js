
const { performance } = require('perf_hooks');
const { processTags } = require('../utils/processTags');

const participantResolvers = {
    Query: {
      participant: async (_, { id }, { models }) => {
        try {
          return await models.Participant.findById(id);
        } catch (error) {
          console.log('Error fetching participant:', error);
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
          console.log('Starting participants query with params:', { 
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
          console.log(`Query completed in ${endTime - startTime}ms`);
          
          return participants;
        } catch (error) {
          console.log('Error in participants query:', error);
          throw new Error(`Failed to fetch participants: ${error.message}`);
        }
      }
    },
 
    Mutation: {
      formatParticipant: async (_, { id }, { models }) => {
        const startTime = performance.now();
        console.log(`Starting formatParticipant for ID: ${id}`);

        try {
          const participant = await models.Participant.findById(id);
          if (!participant) {
            throw new UserInputError('Participant not found');
          }

          const match = await models.Match.findOne({ "metadata.matchId": participant.matchId });

          if (!match) {
            throw new UserInputError('Match not found');
          }
          await match.populate('info.participants');
          
          const tags = await processTags(participant, match);
          participant.tags = tags;
          
          await participant.save();

          const endTime = performance.now();
          console.log(`Formatted participant ${id} in ${endTime - startTime}ms`);
          
          return participant;
        } catch (error) {
          console.log('Error formatting participant:', error);
          throw new Error(`Failed to format participant: ${error.message}`);
        }
      },

      formatAllParticipants: async (_, __, { models }) => {
        const startTime = performance.now();
        console.log('Starting batch format of all participants');

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
                
                const match = await models.Match.findOne({ "metadata.matchId": participant.matchId });

                if (!match) {
                  throw new UserInputError('Match not found');
                }
                await match.populate('info.participants');
                
                const tags = await processTags(participant, match);
                participant.tags = tags;
                
                await participant.save();

                const participantEndTime = performance.now();
                console.log(`Processed ${participant.summonerName} in ${participantEndTime - participantStartTime}ms`);
                
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
          console.log(`Batch processing completed in ${endTime - startTime}ms`);
          console.log('Processing stats:', stats);

          return participants;
        } catch (error) {
          console.log('Fatal error in batch processing:', error);
          throw new Error(`Failed to format participants: ${error.message}`);
        }
      }
    }
};

module.exports = participantResolvers;
