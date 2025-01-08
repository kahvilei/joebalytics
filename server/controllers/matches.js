//controllers/matches.js
const { performance } = require('perf_hooks');
const { AuthenticationError } = require("apollo-server-express");
const { cache: data } = require('../controllers/data');
const { models } = require("mongoose");

// Utility: Map data paths safely
const fetchNestedValue = (obj, path) => path.split('/').reduce((acc, key) => acc?.[key], obj);

// Utility: Aggregate statistics calculations
const calculateAggregateStats = (statRequest, participants) => {
    const values = participants
        .filter(p => !p.gameEndedInEarlySurrender)
        .map(participant => fetchNestedValue(participant, statRequest.path))
        .filter(value => value !== undefined);

    switch (statRequest.aggregation) {
        case 'AVG':
            return values.reduce((a, b) => a + b, 0) / values.length || 0;
        case 'MAX':
            return Math.max(...values);
        case 'MIN':
            return Math.min(...values);
        case 'MODE':
            return values.reduce(
                (a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b),
                values[0]
            );
        case 'SUM':
            return values.reduce((a, b) => a + b, 0);
        case 'UNIQUE':
            return [...new Set(values)];
        case 'COUNT_UNIQUE':
            return [...new Set(values)].length;
        case 'COUNT_EACH':
            return values.reduce((counts, value) => {
                counts[value] = (counts[value] || 0) + 1;
                return counts;
            }, {});
        case 'LIST':
        default:
            return values;
    }
};

// Utility: Extract requested fields
const extractRequestedFields = (info) => {
    const getFields = (selectionSet) =>
        selectionSet.selections.reduce((fields, selection) => {
            fields[selection.name.value] = selection.selectionSet
                ? getFields(selection.selectionSet)
                : 1;
            return fields;
        }, {});
    return getFields(info.fieldNodes[0].selectionSet);
};

// Utility: Build participants query
const buildParticipantsQuery = (filters, summoners) => ({
    gameStartTimestamp: { $lt: filters.timestamp },
    ...(filters.queueIds.length && { queueId: { $in: filters.queueIds } }),
    ...(filters.championIds.length && { championId: { $in: filters.championIds } }),
    ...(filters.roles.length && { teamPosition: { $in: filters.roles } }),
    ...(filters.tags.length && { '$or': filters.tags.map(tag => ({ [`tags.${tag}.isTriggered`]: true })) }),
    ...(summoners.length && { puuid: { $in: summoners.map(summoner => summoner.puuid) } })
});

async function getMatchData(info, filters) {
    const {
        region, summonerNames = [], stats = [], limit
    } = filters;
    const startTime = performance.now();

    // Summoner filtering logic
    const summoners = region
        ? data.summoners.filter(s => summonerNames.includes(s.nameURL))
        : data.summoners;
    console.log(`Summoner filtering took ${performance.now() - startTime}ms`);

    // Build query and fetch participants
    const matchQuery = buildParticipantsQuery(filters, summoners);
    const participants = await models.Participant.find(matchQuery, { matchId: 1, uniqueId: 1, gameMode: 1, abstract: 1 }, { lean: true })
        .sort({ gameStartTimestamp: 'desc' })
        .limit(limit * summoners.length);
    console.log(`Participant query took ${performance.now() - startTime}ms`);

    if (!participants.length) return { matchData: [], statData: { stats: {}, matchCount: 0 } };

    // Fetch matches
    const matchIds = [...new Set(participants.map(p => p.matchId))].slice(0, limit);
    const requestedFields = extractRequestedFields(info);
    const requestedMatchFields = requestedFields.matchData;
    const requestedParticipantFields = requestedFields.matchData.info.participants;
    requestedMatchFields.info.participants = 1;

    let matches = await models.Match.find({ "metadata.matchId": { $in: matchIds } }, requestedMatchFields)
        .sort({ "info.gameStartTimestamp": 'desc' })
        .populate('info.participants', requestedParticipantFields);
    console.log(`Match query took ${performance.now() - startTime}ms`);

    // Format matches
    matches = matches.map(match => {
        const matchObj = match.toObject();
        matchObj.info.participants = matchObj.info.participants.map(p => ({
            ...p,
            tags: Object.fromEntries(p.tags || {})
        }));
        return matchObj;
    });

    // Aggregate stats
    const allParticipants = matches.flatMap(match => match.info.participants.filter(p => summoners.some(s => s.puuid === p.puuid)));
    const aggregatedStats = stats.reduce((acc, statRequest) => {
        acc[statRequest.path] = calculateAggregateStats(statRequest, allParticipants);
        return acc;
    }, {});

    console.log(`Total processing time: ${performance.now() - startTime}ms`);
    return { matchData: matches, statData: { stats: aggregatedStats, matchCount: matches.length } };
}

async function removeOrphanMatches(user) {
    if (!user?.admin) throw new AuthenticationError('Admin access required');

    try {
        const puuids = data.summoners.map(s => s.puuid);
        const result = await models.Match.deleteMany({ "metadata.participants": { $nin: puuids } });
        return { message: `Deleted ${result?.deletedCount || 0} orphan matches`, success: true };
    } catch (error) {
        throw new Error(`Failed to delete orphan matches: ${error.message}`);
    }
}

module.exports = { getMatchData, removeOrphanMatches };