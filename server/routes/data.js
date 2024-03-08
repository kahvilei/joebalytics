const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Mastery = require("../models/Mastery");
// route used to update json file containing information on champions, items, summoner spells, and queue types

// @route GET api/data/update-all
// @description Update all data
// @access Public

//jsons are loaded from riot api and saved to the server
//first, the versions json is loaded to get the current version of the game
//then, the champions, items and summoner spells are loaded
router.get("/", async (req, res) => {
  try {
    const champions = fs.readFileSync(
      path.join(__dirname, "../data/champions.json")
    );
    const items = fs.readFileSync(path.join(__dirname, "../data/items.json"));
    const summonerSpells = fs.readFileSync(
      path.join(__dirname, "../data/summonerSpells.json")
    );
    const queueTypes = fs.readFileSync(
      path.join(__dirname, "../data/queueTypes.json")
    );
    res.json({
      champions: JSON.parse(champions),
      items: JSON.parse(items),
      summonerSpells: JSON.parse(summonerSpells),
      queueTypes: JSON.parse(queueTypes),
    });
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get champion data
router.get("/champions", async (req, res) => {
  try {
    const champions = fs.readFileSync(
      path.join(__dirname, "../data/champions.json")
    );
    res.json(JSON.parse(champions));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get item data
router.get("/items", async (req, res) => {
  try {
    const items = fs.readFileSync(path.join(__dirname, "../data/items.json"));
    res.json(JSON.parse(items));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get summoner spell data
router.get("/summonerSpells", async (req, res) => {
  try {
    const summonerSpells = fs.readFileSync(
      path.join(__dirname, "../data/summonerSpells.json")
    );
    res.json(JSON.parse(summonerSpells));
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

// get queue type data
router.get("/queueTypes", async (req, res) => {
  try {
    const queueTypes = fs.readFileSync(
      path.join(__dirname, "../data/queueTypes.json")
    );
    res.json(JSON.parse(queueTypes));
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
    fs.writeFileSync(
      path.join(__dirname, "../data/champions.json"),
      JSON.stringify(champions.data)
    );
    fs.writeFileSync(
      path.join(__dirname, "../data/items.json"),
      JSON.stringify(items.data)
    );
    fs.writeFileSync(
      path.join(__dirname, "../data/summonerSpells.json"),
      JSON.stringify(summonerSpells.data)
    );
    fs.writeFileSync(
      path.join(__dirname, "../data/queueTypes.json"),
      JSON.stringify(queueTypes.data)
    );
    res.json({ msg: "Updated successfully" });
  } catch {
    res.status(404).json({ msg: "No data found" });
  }
});

module.exports = router;