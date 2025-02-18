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
    const summoners = summonerNames.length>0
        ? data.summoners.filter(s => summonerNames.includes(s.name))
        : data.summoners;
    const puuids = summoners.map(s => s.puuid);
    console.log(`Summoner filtering took ${performance.now() - startTime}ms`);

    // Extract requested fields for projection
    const requestedFields = extractRequestedFields(info);
    const requestedMatchFields = requestedFields.matchData;
    const requestedParticipantFields = requestedFields.matchData.info.participants;
    requestedMatchFields.info.participants = 1;
    const matchProjection = createMatchProjection(requestedFields.matchData);
    const participantProjection = createParticipantProjection(requestedParticipantFields);

    // Build the base query from filters
    const baseQuery = buildParticipantsQuery(filters, summoners);

    try {
        const pipeline = [
            // Start with participants matching our criteria
            { $match: baseQuery },

            // Sort by timestamp first to ensure we get the most recent matches
            { $sort: { gameStartTimestamp: -1 } },

            // Group by matchId to remove duplicates and keep track of relevant participants
            {
                $group: {
                    _id: "$matchId",
                    gameStartTimestamp: { $first: "$gameStartTimestamp" },
                    participants: { $push: "$$ROOT" }
                }
            },

            // Sort again after grouping to maintain order
            { $sort: { gameStartTimestamp: -1 } },

            // Apply the limit to matches
            { $limit: limit },

            // Lookup full match data
            {
                $lookup: {
                    from: "matches",
                    let: { matchId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$metadata.matchId", "$$matchId"] }
                            }
                        },
                        { $project: requestedMatchFields }
                    ],
                    as: "match"
                }
            },

            // Unwind the match array (should only be one match per matchId)
            { $unwind: "$match" },

            // Lookup all participants for each match
            {
                $lookup: {
                    from: "participants",
                    let: { matchId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$matchId", "$$matchId"] }
                            }
                        },
                        { $project: requestedParticipantFields }
                    ],
                    as: "match.info.participants"
                }
            }
        ];

        const results = await models.Participant.aggregate(pipeline);
        console.log(`Aggregation query took ${performance.now() - startTime}ms`);

        if (!results.length) {
            return { matchData: [], statData: { stats: {}, matchCount: 0 } };
        }

        // Format matches
        const matches = results.map(result => {
            const match = result.match;
            match.info.participants = match.info.participants.map(p => ({
                ...p
            }));
            return match;
        });

        // Aggregate stats
        const allParticipants = matches.flatMap(match =>
            match.info.participants.filter(p => puuids.includes(p.puuid))
        );
        const aggregatedStats = stats.reduce((acc, statRequest) => {
            acc[statRequest.path] = calculateAggregateStats(statRequest, allParticipants);
            return acc;
        }, {});

        console.log(`Total processing time: ${performance.now() - startTime}ms`);
        return {
            matchData: matches,
            statData: {
                stats: aggregatedStats,
                matchCount: matches.length
            }
        };

    } catch (error) {
        console.error('Error in getMatchData:', error);
        throw new Error(`Failed to fetch match data: ${error.message}`);
    }
}

// Helper function to create match projection
function createMatchProjection(requestedFields) {
    const projection = {};
    for (const [key, value] of Object.entries(requestedFields)) {
        if (typeof value === 'object') {
            projection[key] = createMatchProjection(value);
        } else {
            projection[key] = value;
        }
    }
    return projection;
}

// Helper function to create participant projection
function createParticipantProjection(requestedFields) {
    const projection = { _id: 0 };  // Exclude _id by default
    for (const [key, value] of Object.entries(requestedFields)) {
        if (typeof value === 'object') {
            projection[key] = createParticipantProjection(value);
        } else {
            projection[key] = value;
        }
    }
    return projection;
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