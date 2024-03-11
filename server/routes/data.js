const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Mastery = require("../models/Mastery");
const e = require("cors");

const bucketName = process.env.BUCKET_NAME;

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(bucketName);
// route used to update json file containing information on champions, items, summoner spells, and queue types

// @route GET api/data/update-all
// @description Update all data
// @access Public

//jsons are loaded from riot api and saved to the server
//first, the versions json is loaded to get the current version of the game
//then, the champions, items and summoner spells are loaded
router.get("/", async (req, res) => {
  try {
    const championsFile = bucket.file("data/champions.json");
    const itemsFile = bucket.file("data/items.json");
    const summonerSpellsFile = bucket.file("data/summonerSpells.json");
    const queueTypesFile = bucket.file("data/queueTypes.json");

    const [championsData] = await championsFile.download();
    const [itemsData] = await itemsFile.download();
    const [summonerSpellsData] = await summonerSpellsFile.download();
    const [queueTypesData] = await queueTypesFile.download();

    res.json({
      champions: JSON.parse(championsData.toString()),
      items: JSON.parse(itemsData.toString()),
      summonerSpells: JSON.parse(summonerSpellsData.toString()),
      queueTypes: JSON.parse(queueTypesData.toString()),
    });
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get champion data
router.get("/champions", async (req, res) => {
  try {
    const championsFile = bucket.file("data/champions.json");
    const [championsData] = await championsFile.download();
    res.json(JSON.parse(championsData.toString()));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get item data
router.get("/items", async (req, res) => {
  try {
    const itemsFile = bucket.file("data/items.json");
    const [itemsData] = await itemsFile.download();
    res.json(JSON.parse(itemsData.toString()));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get summoner spell data
router.get("/summonerSpells", async (req, res) => {
  try {
    const summonerSpellsFile = bucket.file("data/summonerSpells.json");
    const [summonerSpellsData] = await summonerSpellsFile.download();
    res.json(JSON.parse(summonerSpellsData.toString()));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get queue type data
router.get("/queueTypes", async (req, res) => {
  try {
    const queueTypesFile = bucket.file("data/queueTypes.json");
    const [queueTypesData] = await queueTypesFile.download();
    res.json(JSON.parse(queueTypesData.toString()));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

router.get("/update-all", async (req, res) => {
  try {
    const versions = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const version = versions.data[0];
    const champions = await axios.get(
      `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    // for champions data, we will want to cache current mastery data for each champion for all summoners
    // for this we will hit the /api/masteries/champion/:id endpoint for each champion, and then append the data to the champions.json file for each champion
    for (let champion in champions.data.data) {
      let champId = champions.data.data[champion].key;
      let champName = champions.data.data[champion].id;
      let mastery = await Mastery.find({championId: champId}).sort({championPoints: 'desc', championLevel:'desc'});
      champions.data.data[champion].mastery = mastery;
    }
    const items = await axios.get(
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json`
    );
    const summonerSpells = await axios.get(
      `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
    );
    const queueTypes = await axios.get(
      `https://static.developer.riotgames.com/docs/lol/queues.json`
    );

    const saveFileToBucket = async (fileName, data) => {
      const file = bucket.file(`data/${fileName}`);
      await file.save(data);
    };

    await saveFileToBucket("champions.json", JSON.stringify(champions.data));
    await saveFileToBucket("items.json", JSON.stringify(items.data));
    await saveFileToBucket("summonerSpells.json", JSON.stringify(summonerSpells.data));
    await saveFileToBucket("queueTypes.json", JSON.stringify(queueTypes.data));
    res.json({ msg: "Updated successfully" });
  } catch (e){
    res.status(404).json({ msg: e });
  }
});

module.exports = router;