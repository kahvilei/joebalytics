const axios = require("axios");
const { Storage } = require('@google-cloud/storage');
const yaml = require("yaml");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Constants
const BUCKET_NAME = process.env.BUCKET_NAME;
const RIOT_STATIC_BASE_URL = "https://ddragon.leagueoflegends.com/cdn";
const RIOT_API_BASE_URL = "https://static.developer.riotgames.com/docs/lol";
const bucket = new Storage().bucket(BUCKET_NAME);

// cache
const cache = {};

// Helper Function: Fetch Data
const fetchData = async (url) => (await axios.get(url)).data;

// Helper Function: Update Cache
const updateCacheValue = (key, data) => {
    cache[key] = data;
};

// Update Data Function
const updateDataFromRiot = async (models) => {
    const version = (await fetchData(`${RIOT_STATIC_BASE_URL}/versions.json`))[0];

    // Fetch all necessary data
    const [champions, items, summonerSpells, queueTypes] = await Promise.all([
        fetchData(`${RIOT_STATIC_BASE_URL}/${version}/data/en_US/champion.json`),
        fetchData("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json"),
        fetchData(`${RIOT_STATIC_BASE_URL}/${version}/data/en_US/summoner.json`),
        fetchData(`${RIOT_API_BASE_URL}/queues.json`),
    ]);

    // Enhance Champions Data with Mastery Information
    const championData = champions.data;
    for (const championKey in championData.data) {
        const champId = championData.data[championKey].key;
        championData.data[championKey].mastery = await models.Mastery.find({ championId: champId })
            .sort({ championPoints: "desc", championLevel: "desc" });
    }

    // Save Game Data to Bucket
    await Promise.all([
        bucket.file("data/champions.json").save(JSON.stringify(champions)),
        bucket.file("data/items.json").save(JSON.stringify(items)),
        bucket.file("data/summonerSpells.json").save(JSON.stringify(summonerSpells)),
        bucket.file("data/queueTypes.json").save(JSON.stringify(queueTypes)),
    ]);

    // Update Cache
    updateCacheValue("champions", championData);
    updateCacheValue("items", items);
    updateCacheValue("summonerSpells", summonerSpells);
    updateCacheValue("queueTypes", queueTypes);

    return { message: "Game data updated successfully", success: true };
};

// Initialize Function
const initializeCache = async () => {
    const [champions, items, summonerSpells, queueTypes, tags, tagVersions] = await Promise.all([
        bucket.file("data/champions.json").download(),
        bucket.file("data/items.json").download(),
        bucket.file("data/summonerSpells.json").download(),
        bucket.file("data/queueTypes.json").download(),
        bucket.file("data/tags/tags.yaml").download(),
        bucket.file("data/tags/versions.yaml").download(),
    ]);

    // Parse and Update Cache
    updateCacheValue("champions", JSON.parse(champions.toString()));
    updateCacheValue("items", JSON.parse(items.toString()));
    updateCacheValue("summonerSpells", JSON.parse(summonerSpells.toString()));
    updateCacheValue("queueTypes", JSON.parse(queueTypes.toString()));
    updateCacheValue("tags", yaml.parse(tags.toString()));

    const tagVersionsData = yaml.parse(tagVersions.toString());
    updateCacheValue("tagFileVersions", tagVersionsData.versions);
    updateCacheValue("tagCurrentVersion", tagVersionsData.currentVersion);
    updateCacheValue("tagLastBackFill", tagVersionsData.lastBackFill);

    // Populate Summoners from DB
    cache.summoners = await mongoose.models.Summoner.find();
};

module.exports = { cache, updateDataFromRiot, initializeCache, updateCacheValue };