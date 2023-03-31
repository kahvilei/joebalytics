// routes/api/Matches.js

const express = require('express');
const router = express.Router();

// Load Match model
const Match = require('../models/Match');

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
    
  try{
      let matches = await Match.find().sort({gameStartTimestamp: 'desc' })
      res.json(matches);
  }catch(e){
      res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/populate', async (req, res) => {
    
  try{
      let matches = await Match.find().sort({gameStartTimestamp: 'desc' }).populate('info.participants')
      res.json(matches);
  }catch(e){
      res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/:limit/populate', async (req, res) => {
  let limit = req.params.limit;
  try{
      let matches = await Match.find().sort({gameStartTimestamp: 'desc' }).limit(limit).populate('info.participants')
      res.json(matches);
  }catch(e){
      res.status(404).json({ msg: 'No matches found' })
  }
})

router.get('/recent/:limit', async (req, res) => {
  let limit = req.params.limit;
  try{
      let matches = await Match.find().sort({gameStartTimestamp: 'desc' }).limit(limit)
      res.json(matches);
  }catch(e){
      res.status(404).json({ msg: 'No matches found' })
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

module.exports = router;