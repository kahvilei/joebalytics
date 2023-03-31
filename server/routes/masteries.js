// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Mastery = require('../models/Mastery');

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

// @route GET api/match/:id
// @description Get single Match by id
// @access Public
router.get('/:id', (req, res) => {
    Mastery.findById(req.params.id)
    .then(match => res.json(match))
    .catch(err => res.status(404).json({ msg: 'No Mastery found' }));
});

module.exports = router;