const { performance } = require('perf_hooks');
const { addBackFillData, processTags } = require('./tags');
const { cache: data } = require('../controllers/data');
const { getTrackedPuuids } = require('../controllers/summoner');
const { models } = require('mongoose');

// Extracted function to process error handling for stats
function handleProcessingError(error, stats, participant = null, matchId = null) {
    stats.failed++;
    stats.errors.push({
        puuid: participant?.puuid || 'Unknown',
        matchId: matchId || 'Unknown',
        error: error.message
    });
}

// Batch processing and participant processing refactored into a smaller function
async function processMatchBatch(matches, trackedPuuids, stats) {
    const participantsToProcess = [];
    matches.forEach(match => {
        const relevantParticipants = match.info.participants.filter(p => trackedPuuids.has(p.puuid));
        participantsToProcess.push(...relevantParticipants.map(participant => ({ participant, match })));
        stats.total += relevantParticipants.length;
    });

    const bulkOperations = participantsToProcess.map(async ({ participant, match }) => {
        try {
            const participantObject = participant.toObject();
            const matchObject = match.toObject();

            // Prepare participant tags
            participantObject.tags = participantObject.tags ? Object.fromEntries(participantObject.tags) : {};
            matchObject.info.participants = matchObject.info.participants.map(p => {
                if (p.tags) p.tags = Object.fromEntries(p.tags);
                return p;
            });

            const processedTags = await processTags(participantObject, matchObject, data);
            return {
                updateOne: {
                    filter: { _id: participant._id },
                    update: { $set: { tags: processedTags, tagsVersion: data.tagCurrentVersion.id } }
                }
            };
        } catch (error) {
            handleProcessingError(error, stats, participant, match.metadata.matchId);
        }
    });

    // Execute bulk operations
    const validOps = (await Promise.all(bulkOperations)).filter(Boolean);
    if (validOps.length > 0) {
        try {
            await models.Participant.bulkWrite(validOps, { ordered: false });
        } catch (error) {
            handleProcessingError(error, stats);
        }
    }
    stats.success += validOps.length;
    stats.processed += validOps.length;
}

// Main function for formatting all participants
async function formatAllParticipants(user) {
    const BATCH_SIZE = 50;
    const startTime = performance.now();
    console.log('Starting batch format of participants for tracked summoners');
    const stats = { total: 0, processed: 0, success: 0, failed: 0, errors: [] };

    try {
        const trackedPuuids = getTrackedPuuids();
        const matchCursor = models.Match.find({
            'info.gameMode': { $in: ['ARAM', 'CLASSIC'] }
        }).populate('info.participants').sort({ 'info.gameCreation': -1 }).cursor({ batchSize: BATCH_SIZE });

        let batchCounter = 0;
        let matches = [];
        for await (const match of matchCursor) {
            matches.push(match);
            if (matches.length === BATCH_SIZE) {
                await processMatchBatch(matches, trackedPuuids, stats);
                batchCounter++;
                console.log(`Processed batch ${batchCounter}, total processed: ${stats.processed}`);
                matches = [];
            }
        }
        if (matches.length > 0) {
            await processMatchBatch(matches, trackedPuuids, stats);
        }

        console.log(`Processed ${stats.processed} participants out of ${stats.total} in ${performance.now() - startTime}ms`);
        await addBackFillData(stats, user, data);

        return stats;
    } catch (error) {
        console.error('Error processing participants:', error);
        throw new Error(`Failed to format participants: ${error.message}`);
    }
}

module.exports = { formatAllParticipants };