const { performance } = require('perf_hooks');
const { addBackFillData, processTags } = require('./tags');

async function formatParticipant(participant, match, stats) {
    try {
    const participantObject = participant.toObject();
    const participantStartTime = performance.now();
    participantObject.challenges = participantObject.challenges? Object.fromEntries(participantObject.challenges) : {};
    participantObject.tags = participantObject.tags ? Object.fromEntries(participantObject.tags) : {};
    const matchObject = match.toObject();
    // make standard objects out of challenges and perks for each participant
    matchObject.info.participants = matchObject.info.participants.map(participant => {
        let newParticipant = participant;
        if (newParticipant.challenges) {
            newParticipant.challenges = newParticipant.challenges? Object.fromEntries(newParticipant.challenges) : {};
        }
        if (newParticipant.tags) {
            newParticipant.tags = newParticipant.tags? Object.fromEntries(newParticipant.tags) : {};
        }
        return newParticipant;
    });
    participant.tags = await processTags(participantObject, matchObject);
    
    await participant.save();

    const participantEndTime = performance.now();
    console.log(`Processed ${participant.summonerName} in ${participantEndTime - participantStartTime}ms`);
    stats.success++;
    
    return { status: 'fulfilled' };
} catch (error) {
    console.error('Error processing participant:', error);
    stats.failed++;
    stats.errors.push({
      id: participant._id,
      error: error.message
    });
    return { status: 'rejected', reason: error.message };
}
}

async function formatAllParticipants(models, user) {
    const BATCH_SIZE = 50;
    const startTime = performance.now();
    console.log('Starting batch format of participants for tracked summoners');

    const stats = {
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        errors: []
    };

    try {
        // Get all summoner PUUIDs
        const summoners = await models.Summoner.find();
        const trackedPuuids = new Set(summoners.map(s => s.puuid));

        // Create cursor for memory efficient querying
        const cursor = models.Match.find({
            'info.gameMode': { $in: ['ARAM', 'CLASSIC'] }
        }).populate('info.participants').sort({ 'info.gameCreation': -1 }).cursor({ batchSize: BATCH_SIZE });

        let batchCount = 0;
        let matches = [];

        // Process matches in batches
        for await (const match of cursor) {
            matches.push(match);
            
            if (matches.length === BATCH_SIZE) {
                await processMatchBatch(matches, trackedPuuids, stats);
                batchCount++;
                console.log(`Processed batch ${batchCount}, total processed: ${stats.processed}`);
                matches = []; // Clear batch
            }
        }

        // Process remaining matches
        if (matches.length > 0) {
            await processMatchBatch(matches, trackedPuuids, stats);
        }

        const endTime = performance.now();
        console.log(`Batch processing completed in ${endTime - startTime}ms`);
        console.log(`Processed ${stats.processed} participants out of ${stats.total} total`);
        addBackFillData(stats, user);
        return stats;
    } catch (error) {
        console.error('Error processing participants:', error);
        throw new Error(`Failed to format participants: ${error.message}`);
    }
}

async function processMatchBatch(matches, trackedPuuids, stats) {
    for (let match of matches) {
        const relevantParticipants = match.info.participants.filter(p => 
            trackedPuuids.has(p.puuid)
        );
        
        stats.total += relevantParticipants.length;

        for (let participant of relevantParticipants) {
            try {
                await formatParticipant(participant, match, stats);
                stats.processed++;
            } catch (error) {
                stats.failed++;
                stats.errors.push({
                    puuid: participant.puuid,
                    matchId: match.metadata.matchId,
                    error: error.message
                });
            }
        }
    }
}

async function recoverMatchDataFromOrphanParticipants(models, user) {
    const startTime = performance.now();
    console.log('Starting match data recovery from orphan participants');

    const stats = {
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        errors: []
    };

    try {
        // Get all summoner PUUIDs
        const summoners = await models.Summoner.find();
        const trackedPuuids = new Set(summoners.map(s => s.puuid));

        // Create cursor for memory efficient querying
        const cursor = models.Participant.find({
            'abstract': { $exists: true }
        }).sort({ 'gameStartTimestamp': -1 }).cursor({ batchSize: 50 });

        let batchCount = 0;
        let participants = [];

        // Process participants in batches
        for await (const participant of cursor) {
            participants.push(participant);
            
            if (participants.length === 50) {
                await processParticipantBatch(participants, trackedPuuids, stats);
                batchCount++;
                console.log(`Processed batch ${batchCount}, total processed: ${stats.processed}`);
                participants = []; // Clear batch
            }
        }

        // Process remaining participants
        if (participants.length > 0) {
            await processParticipantBatch(participants, trackedPuuids, stats);
        }

        const endTime = performance.now();
        console.log(`Batch processing completed in ${endTime - startTime}ms`);
        console.log(`Processed ${stats.processed} participants out of ${stats.total} total`);
        addBackFillData(stats, user);
        return stats;
    } catch (error) {
        console.error('Error processing participants:', error);
        throw new Error(`Failed to recover match data: ${error.message}`);
    }
}

async function processParticipantBatch(participants, trackedPuuids, stats) {
    for (let participant of participants) {
        if (trackedPuuids.has(participant.puuid)) {
            stats.total++;
            try {
                await processTags(participant);
                stats.processed++;
            } catch (error) {
                stats.failed++;
                stats.errors.push({
                    puuid: participant.puuid,
                    error: error.message
                });
            }
        }
    }
}

module.exports = {
    formatParticipant,
    formatAllParticipants
};