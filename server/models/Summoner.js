const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Load Mastery model
const Mastery = mongoose.models.Mastery;
const Challenge = mongoose.models.Challenge;

const SummonerSchema = new Schema({
  regionDisplay: {
    type: String,
    required: true,
  },
  regionServer: String,
  regionGeo: String,
  regionURL: String,
  nameURL: String,
  tagline: String,
  id: String,
  accountId: String,
  puuid: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Username required"],
  },
  profileIconId: Number,
  revisionDate: Number,
  summonerLevel: Number,
  region: String,
  lastUpdated: Number,
  challengeData: {
    totalPoints: {
      level: String,
      current: Number,
      max: Number,
      percentile: Number,
    },
    categoryPoints: {
      TEAMWORK: {
        level: String,
        current: Number,
        max: Number,
        percentile: Number,
      },
      EXPERTISE: {
        level: String,
        current: Number,
        max: Number,
        percentile: Number,
      },
      IMAGINATION: {
        level: String,
        current: Number,
        max: Number,
        percentile: Number,
      },
      COLLECTION: {
        level: String,
        current: Number,
        max: Number,
        percentile: Number,
      },
      VETERANCY: {
        level: String,
        current: Number,
        max: Number,
        percentile: Number,
      },
    },
    challenges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Challenge",
      },
    ],
    preferences: {
      bannerAccent: String,
      title: String,
      challengeIds: [Number],
    },
  },
  rankedData: [
    {
      leagueId: String,
      queueType: String,
      tier: String,
      rank: String,
      summonerId: String,
      summonerName: String,
      leaguePoints: Number,
      wins: Number,
      losses: Number,
      veteran: Boolean,
      inactive: Boolean,
      freshBlood: Boolean,
      hotStreak: Boolean,
    },
  ],
  masteryData: [
    {
      type: Schema.Types.ObjectId,
      ref: "Mastery",
    },
  ],
});

SummonerSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    if (this) {
      await Mastery.deleteMany({
        _id: {
          $in: this.masteryData,
        },
      });
      await Challenge.deleteMany({
        _id: {
          $in: this.challengeData.challenges,
        },
      });
    }
  }
);

SummonerSchema.index({ nameURL: 1, regionURL: 1 });
SummonerSchema.index({ puuid: 1 });

const Summoner = mongoose.model("Summoner", SummonerSchema);

module.exports = { Summoner };
