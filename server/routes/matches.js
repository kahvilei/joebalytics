// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Match = require('../models/Match');
const Participant = require("../models/Participant");
const Summoner = require("../models/Summoner");

// @route GET api/Matches/test
// @description tests Matches route
// @access Public
router.get('/test', (req, res) => res.send('match route testing!'));

// @route GET api/Matches
// @description Get all Matches
// @access Public
router.get('/', (req, res) => {
  Match.find()
    .then(Matches => res.json(Matches))
    .catch(err => res.status(404).json({ msg: 'No Matches found' }));
});

router.get('/recent', async (req, res) => {

  try {
    let matches = await Match.find().sort({ gameStartTimestamp: 'desc' })
    res.json(matches);
  } catch (e) {
    res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/populate', async (req, res) => {

  try {
    let matches = await Match.find().sort({ gameStartTimestamp: 'desc' }).populate('info.participants')
    res.json(matches);
  } catch (e) {
    res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/:limit/populate', async (req, res) => {
  let limit = req.params.limit;
  try {
    let matches = await Match.find().sort({ gameStartTimestamp: 'desc' }).limit(limit).populate('info.participants')
    res.json(matches);
  } catch (e) {
    res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/:limit', async (req, res) => {
  let limit = req.params.limit;
  try {
    let matches = await Match.find().sort({ gameStartTimestamp: 'desc' }).limit(limit)
    res.json(matches);
  } catch (e) {
    res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/:limit/populate/:region/:name', async (req, res) => {
  let limit = req.params.limit;
  let region = req.params.region;
  let name = req.params.name;

  try {
    let summoner = await Summoner.findOne({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let matches = await Match.find({ "metadata.participants": summoner.puuid, }).sort({ gameStartTimestamp: 'desc' }).limit(limit).populate('info.participants')
      res.json(matches);
    } catch (e) {
      res.status(404).json({ msg: 'No matches found' })
    }
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})

router.get('/recent/:limit/:region/:name', async (req, res) => {
  let limit = req.params.limit;
  let region = req.params.region;
  let name = req.params.name;

  try {
    let summoner = await Summoner.findOne({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let matches = await Match.find({ "metadata.participants": summoner.puuid, }).sort({ gameStartTimestamp: 'desc' }).limit(limit)
      res.json(matches);
    } catch (e) {
      res.status(404).json({ msg: 'No matches found' })
    }
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})


// @route GET api/match/:id
// @description Get single Match by id
// @access Public
router.get('/:id', (req, res) => {
  Match.findById(req.params.id)
    .then(match => res.json(match))
    .catch(err => res.status(404).json({ msg: 'No Matches found' }));
});

// stat specific pulling

router.get('/stats/:mode/:stat/:limit/:aggregation/:region/:name', async (req, res) => {
  let region = req.params.region;
  let name = req.params.name;
  let mode = req.params.mode;
  let stat = req.params.stat;
  let limit = req.params.limit;
  let aggregation = req.params.aggregation;

  try {
    let summoner = await Summoner.findOne({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let matches = [];
      if(mode !== "ANY"){
        matches = await Participant.find({ "puuid": summoner.puuid, "gameMode": mode }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
      }
      else{
        matches = await Participant.find({ "puuid": summoner.puuid }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
      }
      let list = []
      let result = 0;
      for(let match of matches){
        list.push(match[stat])
      }
      if(aggregation === "avg"){
        result = list.reduce((a, b) => a + b) / list.length;
      }else if(aggregation === "max"){
    result = Math.max(...list);
      }else if(aggregation === "min"){
        result = Math.min(...list);
      }else if(aggregation === "mode"){
        result = mathMode(list);
      }else if(aggregation === "add"){
        result = list.reduce((a, b) => a + b);
      }else{
        result = list;
      }
      res.json(result);
    } catch (e) {
      res.status(404).json({ msg: 'No matches found' })
    }
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})

router.get('/stats/:mode/:stat/:subStat/:limit/:aggregation/:region/:name', async (req, res) => {
  let region = req.params.region;
  let name = req.params.name;
  let mode = req.params.mode;
  let stat = req.params.stat;
  let subStat = req.params.subStat;
  let limit = req.params.limit;

  let aggregation = req.params.aggregation;
  if(aggregation === "avg"){

  }

  try {
    let summoner = await Summoner.findOne({
      $and: [{ nameURL: name }, { regionURL: region }],
    });
    try {
      let matches = [];
      if(mode !== "ANY"){
        matches = await Participant.find({ "puuid": summoner.puuid, "gameMode": mode }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
      }
      else{
        matches = await Participant.find({ "puuid": summoner.puuid }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
      }
      let list = []
      let result = 0;
      for(let match of matches){
        if(match.teamEarlySurrendered === false){
          list.push(match[stat][subStat])
        }
      }
      if(aggregation === "avg"){
        result = list.reduce((a, b) => a + b) / list.length;
      }else if(aggregation === "max"){
        result = Math.max(...list);
      }else if(aggregation === "min"){
        result = Math.min(...list);
      }else if(aggregation === "mode"){
        result = mathMode(list);
      }else if(aggregation === "add"){
        result = list.reduce((a, b) => a + b);
      }else{
        result = list;
      }
      res.json(result);
    } catch (e) {
      res.status(404).json({ msg: 'No matches found' })
    }
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})

router.get('/stats/:mode/:stat/:subStat/:limit/:aggregation/', async (req, res) => {
  let mode = req.params.mode;
  let stat = req.params.stat;
  let subStat = req.params.subStat;
  let limit = req.params.limit;

  let aggregation = req.params.aggregation;
  if(aggregation === "avg"){

  }
  let result = [];
  try {
    let summoners = await Summoner.find();
    for(let summoner of summoners){
      try {
        let matches = [];
        if(mode !== "ANY"){
          matches = await Participant.find({ "puuid": summoner.puuid, "gameMode": mode }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
        }
        else{
          matches = await Participant.find({ "puuid": summoner.puuid }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
        }
        let list = []
        
        for(let match of matches){
          if(match.teamEarlySurrendered === false){
  
            list.push(match[stat][subStat]);
          }
        }
        if(aggregation === "avg"){
          result.push({"name" : summoner.name, stat :list.reduce((a, b) => a + b) / list.length});
        }else if(aggregation === "max"){
          result.push({"name" : summoner.name, stat :Math.max(...list)});
        }else if(aggregation === "min"){
          result.push({"name" : summoner.name, stat : Math.min(...list)});
        }else if(aggregation === "mode"){
          result.push({"name" : summoner.name, stat : mathMode(list)});
        }else if(aggregation === "add"){
          result.push({"name" : summoner.name, stat : list.reduce((a, b) => a + b)});
        }else{
          result.push( {"name" : summoner.name, stat : list} );
        }
        
      } catch (e) {
        res.status(404).json({ msg: 'No matches found' })
      }
    }
    res.json(result);
    
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})

router.get('/stats/:mode/:stat/:limit/:aggregation/', async (req, res) => {
  let mode = req.params.mode;
  let stat = req.params.stat;
  let limit = req.params.limit;

  let aggregation = req.params.aggregation;
  if(aggregation === "avg"){

  }
  let result = [];
  try {
    let summoners = await Summoner.find();
    for(let summoner of summoners){
      try {
        let matches = [];
        if(mode !== "ANY"){
          matches = await Participant.find({ "puuid": summoner.puuid, "gameMode": mode }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
        }
        else{
          matches = await Participant.find({ "puuid": summoner.puuid }).sort({ gameStartTimestamp: 'desc' }).limit(limit);
        }
        let list = []
        
        for(let match of matches){
          if(match.teamEarlySurrendered === false){
  
            list.push(match[stat]);
          }
        }
        if(aggregation === "avg"){
          result.push({"name" : summoner.name, stat :list.reduce((a, b) => a + b) / list.length});
        }else if(aggregation === "max"){
          result.push({"name" : summoner.name, stat :Math.max(...list)});
        }else if(aggregation === "min"){
          result.push({"name" : summoner.name, stat : Math.min(...list)});
        }else if(aggregation === "mode"){
          result.push({"name" : summoner.name, stat : mathMode(list)});
        }else if(aggregation === "add"){
          result.push({"name" : summoner.name, stat : list.reduce((a, b) => a + b)});
        }else{
          result.push( {"name" : summoner.name, stat : list} );
        }
        
      } catch (e) {
        return res.status(404).json({ msg: 'Invalid request' })
      }
    }
    res.json(result);
    
  } catch {
    return res.status(404).json({ msg: "No Summoner found" });
  }
})

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


module.exports = router;