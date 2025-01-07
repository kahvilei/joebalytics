const mongoose = require("mongoose");
const { regionMapping } = require("../config/regionMapping");
const {
    getSummonerDetailsByPuuid,
    getSummonerTaglineByPuuid,
    getSummonerDetails,
    recordRecentMatches,
    getChallengeDataByPuuid,
    getChallengeConfig,
    getRankedDataBySummId,
    getMasteryByPuuid,
} = require("./riot");

const { cache: data } = require("../controllers/data");

// Helper function: Update region info for summoner
const updateSummonerRegionInfo = (summoner) => {
    const { server, geo } = regionMapping[summoner.regionDisplay];
    summoner.regionServer = server;
    summoner.regionGeo = geo;
};

// Helper function: Format name URL
const formatNameURL = (name, tagline) =>
    `${name.toLowerCase().replaceAll(" ", "-")}-${tagline.toLowerCase()}`;

// Helper function: Update summoner details from Riot response
const updateSummonerFromResponse = (summoner, response, tagline) => {
    summoner.id = response.data.id;
    summoner.accountId = response.data.accountId;
    summoner.puuid = response.data.puuid;
    summoner.name = tagline.data.gameName;
    summoner.tagline = tagline.data.tagLine;
    summoner.profileIconId = response.data.profileIconId;
    summoner.revisionDate = response.data.revisionDate;
    summoner.summonerLevel = response.data.summonerLevel;
    summoner.nameURL = formatNameURL(summoner.name, summoner.tagline);
    summoner.regionURL = summoner.regionDisplay.toLowerCase();
    summoner.lastUpdated = Date.now();
};

// Helper function: Handle challenges update
const updateChallenges = async (summoner, challengeData, challengeConfig) => {
    const challengeList = [];
    for (const challenge of challengeData.data.challenges) {
        const config = challengeConfig.data.find(
            (cfg) => cfg.id === challenge.challengeId
        );
        if (config) {
            challenge.challengeName = config.localizedNames.en_US.name;
            challenge.shortDesc = config.localizedNames.en_US.shortDescription;
            challenge.summonerName = summoner.name;
            challenge.profileIconId = summoner.profileIconId;
            challenge.puuid = summoner.puuid;
            challenge.uniqueId = `${summoner.puuid}${challenge.challengeId}`;
            challengeList.push(challenge);
            console.log(`Challenge ${challenge.challengeId} created for ${summoner.name}`);
        }
    }
    const newChallenges = await mongoose.models.Challenge.insertMany(challengeList);
    summoner.challengeData.challenges = newChallenges;
    summoner.challengeData.categoryPoints = challengeData.data.categoryPoints;
    summoner.challengeData.totalPoints = challengeData.data.totalPoints;
    summoner.challengeData.preferences = challengeData.data.preferences;
};

// Main function: Validate and update summoner
async function validateAndUpdateSummoner(summoner) {
    updateSummonerRegionInfo(summoner);

    let isFirstTimeSave = false;
    let response, tagline;

    if (summoner.puuid) {
        response = await getSummonerDetailsByPuuid(summoner.puuid, summoner.regionServer);
        tagline = await getSummonerTaglineByPuuid(summoner.puuid, summoner.regionGeo);
    } else {
        isFirstTimeSave = true;
        response = await getSummonerDetails(summoner.name, summoner.regionServer);
    }

    if (response.status !== 200 || tagline.status !== 200) {
        console.log("unable to find summoner based on values provided");
        return "unable to find summoner based on values provided";
    }

    updateSummonerFromResponse(summoner, response, tagline);
    await recordRecentMatches(summoner.puuid, summoner.regionGeo, isFirstTimeSave);

    try {
        // Update challenges
        await mongoose.models.Challenge.deleteMany({
            _id: { $in: summoner.challengeData.challenges },
        });
        const challengeData = await getChallengeDataByPuuid(summoner.puuid, summoner.regionServer);
        if (!challengeData.response) {
            const challengeConfig = await getChallengeConfig();
            await updateChallenges(summoner, challengeData, challengeConfig);
            console.log(`Challenge updates complete for ${summoner.name}`);
        }
    } catch (e) {
        console.log("Error updating challenges:", e);
    }

    try {
        // Update ranked data
        const rankedData = await getRankedDataBySummId(summoner.id, summoner.regionServer);
        if (!rankedData.response) summoner.rankedData = rankedData.data;

        // Update mastery
        await mongoose.models.Mastery.deleteMany({ _id: { $in: summoner.masteryData } });
        const masteryData = await getMasteryByPuuid(summoner.puuid, summoner.regionServer);
        if (!masteryData.response) {
            const masteryList = masteryData.data.map((mastery) => ({
                ...mastery,
                summonerName: summoner.name,
                summonerId: summoner.id,
                profileIconId: summoner.profileIconId,
                uniqueId: `${summoner.puuid}-${mastery.championId}`,
            }));
            summoner.masteryData = await mongoose.models.Mastery.insertMany(masteryList);
            console.log(`Mastery updates complete for ${summoner.name}`);
        }
    } catch (e) {
        console.log("Error updating mastery:", e);
    }

    return summoner;
}

module.exports = validateAndUpdateSummoner;