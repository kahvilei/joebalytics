
const { performance } = require('perf_hooks');
const { formatParticipant, formatAllParticipants } = require('../controllers/participants');
const path = require('path');

const yaml = require('js-yaml');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);


const participantResolvers = {
    Mutation: {
      formatOneParticipant: async (_, { id }, { models }) => {
        const startTime = performance.now();

        const [tagsfile] = await bucket.file("data/tags.yaml").download();
        const tagsParsed = yaml.load(tagsfile.toString());

        console.log(`Starting formatParticipant for ID: ${id}`);

        const participant = await models.Participant.findById(id);
        if (!participant) {
          throw new Error('Participant not found');
        }

        try {
          await formatParticipant(participant, models, tagsParsed);
          const endTime = performance.now();
          console.log(`Processing completed in ${endTime - startTime}ms`);
          return participant;
        } catch (error) {
          console.log('Error processing participant:', error);
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

        let participants = [];

        try{
          participants = await formatAllParticipants(models);
        } catch (error) {
          console.log('Error processing participants:', error);
          throw new Error(`Failed to format participants: ${error.message}`);
        }

        const endTime = performance.now();
        console.log(`Batch processing completed in ${endTime - startTime}ms`);
        return participants;
      }
    }
};

module.exports = participantResolvers;
