//controllers/matches.js

// third party
const { performance } = require('perf_hooks');
const {AuthenticationError} = require("apollo-server-express");


// helper functions
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

// mode function
async function getMatchData(models, info, data, filters) {
    const {
        region,
        summonerNames = [],
        roles = [],
        championIds = [],
        queueIds = [],
        tags = [],
        stats = [],
        limit,
        timestamp
    } = filters;

    const totalTimeStart = performance.now();

    const summonerQuery = {};
    if (region) summonerQuery.regionURL = region;
    if (summonerNames.length > 0) summonerQuery.nameURL = { $in: summonerNames };

    const summoners = Object.keys(summonerQuery).length > 0
        ? data.summoners.filter(summoner => summonerNames.includes(summoner.nameURL))
        : data.summoners;

    console.log(`Collecting summoners took ${performance.now() - totalTimeStart}ms`);

    const query = {
        gameStartTimestamp: { $lt: timestamp },
        ...(queueIds.length > 0 && { queueId: { $in: queueIds } }),
        ...(championIds.length > 0 && { championId: { $in: championIds } }),
        ...(roles.length > 0 && { teamPosition: { $in: roles } }),
        ...(tags.length > 0 && { '$or': tags.map(tag => ({ [`tags.${tag}.isTriggered`]: true })) }),
        ...(summoners.length > 0 && { puuid: { $in: summoners.map(summoner => summoner.puuid) } })
    };

    const participants = await models.Participant.find(query, { matchId: 1, uniqueId: 1, gameMode: 1, abstract: 1 })
        .sort({ gameStartTimestamp: 'desc' })
        .limit(limit * summoners.length);

    console.log(`Participant query took ${performance.now() - totalTimeStart}ms`);

    if (participants?.length === 0) {
        return {
            matchData: [],
            statData: {
                stats: {},
                matchCount: 0
            }
        };
    }

    const matchIds = [...new Set(participants.map(participant => participant.matchId))].slice(0, limit);

    const requestedFields = extractFields(info);
    const participantFields = requestedFields.matchData.info.participants;
    const requestedFieldsMatch = new Object(requestedFields.matchData);
    requestedFieldsMatch.info.participants = 1;

    let matches = await models.Match.find({ "metadata.matchId": { $in: matchIds } }, requestedFieldsMatch)
        .sort({ "info.gameStartTimestamp": 'desc' })
        .populate('info.participants', participantFields);

    console.log(`Match query took ${performance.now() - totalTimeStart}ms`);

    matches = matches.map(match => {
        const newMatch = match.toObject();
        newMatch.info.participants = newMatch.info.participants.map(participant => {
            if (participant.tags) participant.tags = Object.fromEntries(participant.tags);
            return participant;
        });
        return newMatch;
    })

    const allParticipants = matches.flatMap(match =>
        match.info.participants.filter(p =>
            summoners.some(op => op.puuid === p.puuid)
        )
    );

    const results = stats.reduce((acc, statRequest) => {
        const values = allParticipants
            .filter(p => !p.gameEndedInEarlySurrender)
            .map(participant => statRequest.path.split('/').reduce((obj, key) => obj?.[key], participant))
            .filter(value => value !== undefined);

        switch (statRequest.aggregation) {
            case 'AVG':
                acc[statRequest.path] = values.reduce((a, b) => a + b, 0) / values.length;
                break;
            case 'MAX':
                acc[statRequest.path] = Math.max(...values);
                break;
            case 'MIN':
                acc[statRequest.path] = Math.min(...values);
                break;
            case 'MODE':
                acc[statRequest.path] = values.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b));
                break;
            case 'SUM':
                acc[statRequest.path] = values.reduce((a, b) => a + b, 0);
                break;
            case 'UNIQUE':
                acc[statRequest.path] = [...new Set(values)];
                break;
            case 'COUNT_UNIQUE':
                acc[statRequest.path] = [...new Set(values)].length;
                break;
            case 'COUNT_EACH':
                acc[statRequest.path] = values.reduce((a, b) => ({ ...a, [b]: (a[b] || 0) + 1 }), {});
                break;
            case 'LIST':
            default:
                acc[statRequest.path] = values;
        }
        return acc;
    }, {});

    console.log(`Total time: ${performance.now() - totalTimeStart}ms`);

    return {
        matchData: matches,
        statData: {
            stats: results,
            matchCount: matches.length
        }
    };
}

async function deleteOrphanMatches(models, user, data) {
    if (!user?.admin) throw new AuthenticationError('Admin access required');
    try {
        const summoners = data.summoners;
        const puuids = summoners.map(s => s.puuid);
        const result = await models.Match.deleteMany({
            "metadata.participants": { $nin: puuids }
        });

        if (!result.deletedCount){
            result.deletedCount = 0;
        }

        return {
            message: `Deleted ${result?.deletedCount} orphan matches`,
            success: true
        };
    } catch (error) {
        throw new Error(`Failed to delete orphan matches: ${error.message}`);
    }
}

module.exports = {
    getMatchData,
    deleteOrphanMatches
};