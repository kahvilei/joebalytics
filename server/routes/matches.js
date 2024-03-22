// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Match = require('../models/Match');
const Participant = require("../models/Participant");
const Summoner = require("../models/Summoner");
const acceptedQueues = ['2','4','6','7','76','900','700','325','400','410','420','430','440','450','720','1400'];

const { isLoggedIn, isAdmin } = require("../middleware");

// @route GET api/matches
// @description Get recent matches based on provided headers. Headers include 'X-Champ', 'X-Role', 'X-Mode', 'X-Limit', 'X-Timestamp', 'X-Region', and 'X-Name'. If no headers are provided, defaults are used.
// @access Public

router.get('/', async (req, res) => {
  let limit = req.headers['x-limit'] ? req.headers['x-limit'] : '20';
  let timestamp = req.headers['x-timestamp'] ? req.headers['x-timestamp'] : Date.now();
  
  let region = req.headers['x-region'] === "any" ? {$exists: true} : req.headers['x-region'];
  let name = req.headers['x-name'] === "any" ? {$exists: true} : req.headers['x-name'];
  let role = req.headers['x-role'] === "any" ? {$exists: true} : req.headers['x-role'];
  let champ = req.headers['x-champ'] === "any" ? {$exists: true} : req.headers['x-champ'];
  let mode = req.headers['x-mode'] === "any" ? { $in: acceptedQueues } : req.headers['x-mode'];

  try {
    let summoner = await Summoner.find({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let puuids = summoner.map((summoner) => summoner.puuid);

      let participants = await Participant.find({ "puuid": { $in: puuids}, "queueId": mode, "championId" : champ, "teamPosition": role, "gameStartTimestamp": { $lt: timestamp } }).sort({ gameStartTimestamp: 'desc' }).limit(limit);

      let matchIds = participants.map((participant) => participant.matchId);

      let matches = await Match.find({ "metadata.matchId": { $in: matchIds }}).sort({ "info.gameStartTimestamp": 'desc' }).limit(limit).populate('info.participants')
      res.json(matches);
    } catch (e) {
      res.status(404).json({ msg: 'No matches found' })
    }
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
});


// @route delete api/matches/orphan-matches
// @description delete all irrelevant matches that do not contain any participants matching the summoner database
// requires authentication

router.delete('/orphan-matches', isAdmin, async (req, res) => {
  try {
    let summoners = await Summoner.find();
    let puuids = summoners.map((summoner) => summoner.puuid);
    let matches = await Match.find({ "metadata.participants": { $in: puuids } });
    let matchIds = matches.map((match) => match.metadata.matchId);
    await Match.deleteMany({ "metadata.matchId": { $nin: matchIds } });
    res.json({ msg: "Matches cleaned" });
  } catch (e) {
    res.status(404).json({ msg: e })
  }
})

// @route GET api/matches/orphan-matches
// @description Get all matches that do not contain any participants matching the summoner database
// requires authentication

router.get('/orphan-matches', async (req, res) => {
  try {
    let summoners = await Summoner.find();
    let puuids = summoners.map((summoner) => summoner.puuid);
    let matches = await Match.find({ "metadata.participants": { $nin: puuids } });
    res.json(matches);
  } catch (e) {
    res.status(404).json({ msg: e })
  }
})

// @route GET api/matches/stats
// @description Get stats based on provided headers. Headers include 'X-Stats', 'X-Region', 'X-Name', 'X-Role', 'X-Champ', and 'X-Mode'. If no headers are provided, defaults are used.
// @access Public

router.get('/stats', async (req, res) => {
  let region = req.headers['x-region'] === "any" ? {$exists: true} : req.headers['x-region'];
  let name = req.headers['x-name'] === "any" ? {$exists: true} : req.headers['x-name'];
  let stats;
    if (req.headers['x-stats']) {
      stats = JSON.parse(req.headers['x-stats']);
    } else {
      stats = [{ stat: "win", aggregation: "any" }];
    }
    let limit = req.headers['x-limit'] ? req.headers['x-limit'] : '20';
  let role = req.headers['x-role'] === "any" ? {$exists: true} : req.headers['x-role'];
  let champ = req.headers['x-champ'] === "any" ? {$exists: true} : req.headers['x-champ'];
  let mode = req.headers['x-mode'] === "any" ? { $in: acceptedQueues } : req.headers['x-mode'];

  try {
    let summoner = await Summoner.find({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let puuids = summoner.map((summoner) => summoner.puuid);
      let matches = [];
      matches = await Participant.find({ "puuid": { $in: puuids}, "queueId": mode, "championId" : champ, "teamPosition": role}).sort({ gameStartTimestamp: 'desc' }).limit(limit);

      let results = {};
      for(let statObj of stats){
        let list = []
        let result = 0;
        let statPath = statObj.stat.split('/');
        for(let match of matches){
          if(match.teamEarlySurrendered === false){
            let value = match;
            for(let path of statPath){
              value = value[path];
            }
            list.push(value);
          }
        }
        if(statObj.aggregation === "avg"){
          //this should return more than one decimal place
          result = list.reduce((a, b) => a + b) / list.length;
        }else if(statObj.aggregation === "max"){
          result = Math.max(...list);
        }else if(statObj.aggregation === "min"){
          result = Math.min(...list);
        }else if(statObj.aggregation === "mode"){
          result = mathMode(list);
        }else if(statObj.aggregation === "unique"){
          result = list.filter(onlyUnique);
        }else if(statObj.aggregation === "add"){
          result = list.reduce((a, b) => a + b);
        }else{
          result = list;
        }
        results[statObj.stat] = result;
      }
      res.json(results);
    } catch (e) {
      res.status(404).json({ msg: e })
    }
  } catch (error){
    return res.status(404).json({ msg: error });
  }
});

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

var mathMode = a => {
  a = a.slice().sort((x, y) => x - y);

  var bestStreak = 1;
  var bestElem = a[0];
  var currentStreak = 1;
  var currentElem = a[0];

  for (let i = 1; i < a.length; i++) {
    if (a[i-1] !== a[i]) {
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        bestElem = currentElem;
      }

      currentStreak = 0;
      currentElem = a[i];
    }

    currentStreak++;
  }

  return currentStreak > bestStreak ? currentElem : bestElem;
};

// @route GET api/match/:id
// @description Get single Match by id
// @access Public
router.get('/:id', (req, res) => {
  Match.findById(req.params.id)
    .then(match => res.json(match))
    .catch(err => res.status(404).json({ msg: err }));
});



module.exports = router;