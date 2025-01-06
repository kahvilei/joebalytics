const {performance} = require('perf_hooks');
const {formatAllParticipants, recoverMatchDataFromOrphanParticipants} = require('../controllers/participants');
const {AuthenticationError} = require("apollo-server-express");

const participantResolvers = {
    Mutation: {
        formatAllParticipants: async (_, __, {models, user, data}) => {
            if (!user?.admin) throw new AuthenticationError('Admin access required');
            const startTime = performance.now();
            console.log('Starting batch format of all participants');

            let stats = {
                total: 0,
                success: 0,
                failed: 0,
                errors: []
            };

            try {
                stats = await formatAllParticipants(models, user, data);
            } catch (error) {
                console.log('Error processing participants:', error);
                throw new Error(`Failed to format participants: ${error.message}`);
            }

            const endTime = performance.now();
            console.log(`Batch processing completed in ${endTime - startTime}ms`);
            return stats;
        },

        recoverMatchDataFromOrphanParticipants: async (_, __, {models, user}) => {
            if (!user?.admin) throw new AuthenticationError('Admin access required');
            const startTime = performance.now();
            console.log('Starting match data recovery from orphan participants');

            let stats = {
                total: 0,
                success: 0,
                failed: 0,
                errors: []
            };

            try {
                stats = await recoverMatchDataFromOrphanParticipants(models, user);
            } catch (error) {
                console.log('Error processing participants:', error);
                throw new Error(`Failed to recover match data: ${error.message}`);
            }

            const endTime = performance.now();
            console.log(`Match data recovery completed in ${endTime - startTime}ms`);
            return stats;
        }
    }
};

module.exports = participantResolvers;
