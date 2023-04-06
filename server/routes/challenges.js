// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Challenges = require('../models/Challenge');
const Summoner = require("../models/Summoner");

// @route GET api/Matches/test
// @description tests Matches route
// @access Public
router.get('/test', (req, res) => res.send('Challenges route testing!'));

// @route GET api/Matches
// @description Get all Matches
// @access Public
router.get('/', async (req, res) => {
    try{
        let challenges = await Challenges.find().sort({percentile: 'asc', challengeId:'asc' })
        res.json(challenges);
    }catch(e){
        res.status(404).json({ msg: 'No Challenges found' })
    }
})

router.get('/top', async (req, res) => {
    
    try{
        let challenges = await Challenges.find().sort({percentile: 'asc', challengeId:'asc' })
        res.json(challenges);
    }catch(e){
        res.status(404).json({ msg: 'No Challenges found' })
    }
})

router.get('/top/:limit', async (req, res) => {
    let limit = req.params.limit;
    try{
        let challenges = await Challenges.find().sort({percentile: 'asc', challengeId:'asc' }).limit(limit)
        res.json(challenges);
    }catch(e){
        res.status(404).json({ msg: 'No Challenges found' })
    }
})

router.get('/top/:limit/:region/:name', async (req, res) => {
    let limit = req.params.limit;
    let region = req.params.region;
    let name = req.params.name;
  
    try {
      let summoner = await Summoner.findOne({
        $and: [{ nameURL: name }, { regionURL: region }],
      });
      try {
        let challenges = await Challenges.find({ "puuid": summoner.puuid, }).sort({percentile: 'asc', challengeId:'asc' }).limit(limit);
        res.json(challenges);
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
    Challenges.findById(req.params.id)
    .then(match => res.json(match))
    .catch(err => res.status(404).json({ msg: 'No Challenges found' }));
});

module.exports = router;