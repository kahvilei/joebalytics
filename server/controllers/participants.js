const { UserInputError } = require('apollo-server-express');
const { performance } = require('perf_hooks');
const { getTagFile, addBackFillData, processTags } = require('./tags');

async function formatParticipant(participant, match, stats) {
    try {
    const participantObject = participant.toObject();
    const participantStartTime = performance.now();
    participantObject.challenges = Object.fromEntries(participantObject.challenges);
    participantObject.tags = Object.fromEntries(participantObject.tags);
    const matchObject = match.toObject();
    // objectize challenges and perks for each participant
    matchObject.info.participants = matchObject.info.participants.map(participant => {
        let newParticipant = participant;
        if (newParticipant.challenges) {
            newParticipant.challenges = Object.fromEntries(newParticipant.challenges);
        }
        if (newParticipant.tags) {
            newParticipant.tags = Object.fromEntries(newParticipant.tags);
        }
        return newParticipant;
    });
    const tags = await processTags(participantObject, matchObject);
    participant.tags = tags;
    
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

        // Get all ARAM and CLASSIC gameMode matches
        const matches = await models.Match.find({
            'info.gameMode': { $in: ['ARAM', 'CLASSIC'] }
        }).populate('info.participants');
        
        // Process each match's participants
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

module.exports = {
    formatParticipant,
    formatAllParticipants
};