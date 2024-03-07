// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Mastery = require('../models/Mastery');
const Summoner = require("../models/Summoner");

// @route GET api/Matches/test
// @description tests Matches route
// @access Public
router.get('/test', (req, res) => res.send('Mastery route testing!'));

// @route GET api/Matches
// @description Get all Matches
// @access Public
router.get('/', async (req, res) => {
    try{
        let mastery = await Mastery.find();
        res.json(mastery);
    }catch(e){
        res.status(404).json({ msg: 'No Mastery found' })
    }
})

router.get('/by-champ', async (req, res) => {
    
    try{
        let mastery = await Mastery.find().sort({championId: 'asc', championPoints: 'desc', championLevel:'desc'});
        res.json(mastery);
    }catch(e){
        res.status(404).json({ msg: 'No Mastery found' })
    }
})

router.get('/champion/:id', async (req, res) => {
    let id = req.params.id;
    try{
        let mastery = await Mastery.find({championId: id}).sort({championPoints: 'desc', championLevel:'desc'});
        res.json(mastery);
    }catch(e){
        res.status(404).json({ msg: 'No Mastery found' })
    }
})

router.get('/top', async (req, res) => {
    
    try{
        let mastery = await Mastery.find().sort({championPoints: 'desc', championLevel:'desc'});
        res.json(mastery);
    }catch(e){
        res.status(404).json({ msg: 'No Mastery found' })
    }
})

router.get('/top/:limit', async (req, res) => {
    let limit = req.params.limit;
    try{
        let mastery = await Mastery.find().sort({championPoints: 'desc', championLevel:'desc'}).limit(limit);
        res.json(mastery);
    }catch(e){
        res.status(404).json({ msg: 'No Mastery found' })
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
        let mastery = await Mastery.find({ "summonerId": summoner.id }).sort({championPoints: 'desc', championLevel:'desc'}).limit(limit);
        res.json(mastery);
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
    Mastery.findById(req.params.id)
    .then(match => res.json(match))
    .catch(err => res.status(404).json({ msg: 'No Mastery found' }));
});

module.exports = router;