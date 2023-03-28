// routes/api/summoners.js

const express = require("express");
const router = express.Router();

// Load Book model
const Summoner = require("../models/Summoner");
const Match = require("../models/Match");
const { removeMatchesbyPuuid } = require("../controllers/riot");
const { isLoggedIn } = require('../middleware');

// @route GET api/summoners/test
// @description tests summoners route
// @access Public
router.get("/test", (req, res) => res.send("summoner route testing!"));

// @route GET api/summoners
// @description Get all summoners
// @access Public
router.get("/", async (req, res) => {
  try {
    let summoners = await Summoner.find();
    res.json(summoners);
  } catch {
    res.status(404).json({ msg: "No Summoners found" });
  }
});

// @route GET api/summoners/:id
// @description Get single summoner by id
// @access Public
router.get("/:id", async (req, res) => {
  try {
    let summoner = await Summoner.findById(req.params.id);
    res.json(summoner);
  } catch {
    res.status(404).json({ msg: "No Summoner found" });
  }
});

router.get("/:region/:name", async (req, res) => {
  try {
    let summoner = await Summoner.findOne( {$and: [
      { nameURL: req.params.name },
      { regionURL: req.params.region },
      ]});
    res.json(summoner);
  } catch {
    res.status(404).json({ msg: "No Summoner found" });
  }
});

// @route GET api/summoners
// @description add/save summoner
// @access Public
router.post("/", isLoggedIn, async (req, res) => {
  try {
    let summoner = await Summoner.create(req.body);
    res.json({ msg: "Summoner added successfully" });
  } catch (e) {
    if (e.code == 11000) {
      res
        .status(400)
        .json({ msg: `This summoner already exists in the database` });
    } else {
      res.status(400).json({ msg: `Unable to add this Summoner, ${e}` });
    }
  }
});

// @route GET api/summoners/:id
// @description Update summoner
// @access Public
router.put("/:id", async (req, res) => {
  try {
    let summoner = await Summoner.findById(req.params.id);
    await summoner.save();
    res.json({ msg: "Updated successfully" });
  } catch (e) {
    res.status(400).json({ msg: "Unable to update the Database" });
  }
});

// @route GET api/summoners/:id
// @description Delete summoner by id
// @access Public
router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    let summoner = await Summoner.findById(req.params.id);
    await summoner.deleteOne();
    res.json({ mgs: "Summoner entry deleted successfully" });
  } catch (e) {
    res.status(404).json({ msg: `Error in deletion: ${e}` });
  }
});

module.exports = router;
