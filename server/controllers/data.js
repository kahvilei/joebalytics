

const axios = require("axios");
const { Storage } = require('@google-cloud/storage');
const yaml = require('yaml');

const storage = new Storage();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

async function updateData(models, data) {
    // Update data
    const versions = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
    const version = versions.data[0];

    // Fetch new data
    const champions = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    const items = await axios.get(
        `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json`
    );
    const summonerSpells = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
    );
    const queueTypes = await axios.get(
        `https://static.developer.riotgames.com/docs/lol/queues.json`
    );

    // Add mastery data to champions
    for (let champion in champions.data.data) {
        const champId = champions.data.data[champion].key;
        const mastery = await models.Mastery.find({ championId: champId })
            .sort({ championPoints: 'desc', championLevel: 'desc' });
        champions.data.data[champion].mastery = mastery;
    }

    // Save to bucket
    await Promise.all([
        bucket.file("data/champions.json").save(JSON.stringify(champions.data)),
        bucket.file("data/items.json").save(JSON.stringify(items.data)),
        bucket.file("data/summonerSpells.json").save(JSON.stringify(summonerSpells.data)),
        bucket.file("data/queueTypes.json").save(JSON.stringify(queueTypes.data))
    ]);

    //update data in memory
    data.champions = champions.data;
    data.items = items.data;
    data.summonerSpells = summonerSpells.data;
    data.queueTypes = queueTypes.data;

    return {
        message: "Game data updated successfully",
        success: true
    };
}

async function initializeData(data) {
    const [champions, items, summonerSpells, queueTypes, tags, tagVersions] = await Promise.all([
        bucket.file("data/champions.json").download(),
        bucket.file("data/items.json").download(),
        bucket.file("data/summonerSpells.json").download(),
        bucket.file("data/queueTypes.json").download(),
        bucket.file("data/tags/tags.yaml").download(),
        bucket.file("data/tags/versions.yaml").download()   
    ]);

    const tagVersionsData = yaml.parse(tagVersions.toString());

    data.champions = JSON.parse(champions.toString());
    data.items = JSON.parse(items.toString());
    data.summonerSpells = JSON.parse(summonerSpells.toString());
    data.queueTypes = JSON.parse(queueTypes.toString());
    data.tags = yaml.parse(tags.toString());
    data.tagFileVersions = tagVersionsData.versions;
    data.tagCurrentVersion = tagVersionsData.currentVersion;
    data.tagLastBackFill = tagVersionsData.lastBackFill;
}

module.exports = {
    updateData,
    initializeData
};