const { UserInputError } = require('apollo-server-express');
const { performance } = require('perf_hooks');
const { getTagFile } = require('./tags');

async function formatParticipant(participant, models) {
    try{
    const participantStartTime = performance.now();
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
    
    return { status: 'fulfilled' };
} catch (error) {
    stats.errors.push({
      id: participant._id,
      error: error.message
    });
    return { status: 'rejected', reason: error.message };
}
}

async function formatAllParticipants(models) {
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

        // Get all matches and populate participants
        const matches = await models.Match.find().populate('info.participants');
        
        // Process each match's participants
        for (let match of matches) {
            const relevantParticipants = match.info.participants.filter(p => 
                trackedPuuids.has(p.puuid)
            );
            
            stats.total += relevantParticipants.length;

            for (let participant of relevantParticipants) {
                try {
                    await formatParticipant(participant, models);
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