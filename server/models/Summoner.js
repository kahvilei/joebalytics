const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {
  getMasteryByPuuid,
  getRankedDataBySummId,
  getSummonerDetails,
  getSummonerDetailsByPuuid,
  recordRecentMatches,
  getChallengeDataByPuuid,
  getChallengeConfig,
  getSummonerTaglineByPuuid,
} = require("../controllers/riot");
const { regionMapping } = require("../config/regionMapping");
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
    //validation is performed on summoner name since it is from raw user input, whereas the region is restricted to choices and the rest is provided by riot.
    validate: {
      validator: async function () {
        let server = regionMapping[this.regionDisplay].server;
        let geo = regionMapping[this.regionDisplay].geo;
        this.regionServer = server;
        this.regionGeo = geo;
        let tagline;

        let response;
        let init = false; //this determines whether or not this is treated as a first time save
        //if the puuid already exists, we will use it to query riot's servers
        if (this.puuid != null) {
          response = await getSummonerDetailsByPuuid(
            this.puuid,
            this.regionServer
          );
          tagline = await getSummonerTaglineByPuuid(this.puuid, this.regionGeo);
        } else {
          //if not, we will find user info using the region and summoner name
          init = true;
          response = await getSummonerDetails(this.name, this.regionServer);
        }

        if (response.status !== 200 || tagline.status !== 200) {
          console.log("unable to find summoner based on values provided");
          return "unable to find summoner based on values provided";
        } else {
          //set main values based on riot response
          this.id = response.data.id;
          this.accountId = response.data.accountId;
          this.puuid = response.data.puuid;
          this.name = tagline.data.gameName;
          this.tagline = tagline.data.tagLine;
          this.profileIconId = response.data.profileIconId;
          this.revisionDate = response.data.revisionDate;
          this.summonerLevel = response.data.summonerLevel;

          let nameURLdebug = this.name.toLowerCase().replaceAll(" ", "-") + "-" + this.tagline.toLowerCase();

          this.regionURL = this.regionDisplay.toLowerCase();
          this.nameURL = nameURLdebug;

          //update update time to now
          let currentDate = new Date();
          let timestamp = currentDate.getTime();
          this.lastUpdated = timestamp;

          //records all user matches from the last match added matching this user's puuid to now, if this is the first save, it loads 20 games
          await recordRecentMatches(this.puuid, this.regionGeo, init);

          try {
            await Challenge.deleteMany({
              _id: {
                $in: this.challengeData.challenges,
              },
            });
            this.challengeData.challenges = [];
            //gets all challenge data from riot
            let challengeList = [];
            let challengeData = await getChallengeDataByPuuid(
              this.puuid,
              this.regionServer
            );
            if (
              challengeData.response !== undefined &&
              challengeData.response !== null
            ) {
              return false;
            } else {
              //creates new and updates existing mastery items for this summoner
              let challengeConfig = await getChallengeConfig();
              for (let challenge of challengeData.data.challenges) {
                try {
                  let config = challengeConfig.data.find(
                    (challengeConfig) =>
                      challengeConfig.id === challenge.challengeId
                  );
                  if (config) {
                    challenge.challengeName = config.localizedNames.en_US.name;
                    challenge.shortDesc =
                      config.localizedNames.en_US.shortDescription;
                    challenge.summonerName = this.name;
                    challenge.profileIconId = this.profileIconId;
                    challenge.puuid = this.puuid;
                    challenge.uniqueId = this.puuid + challenge.challengeId;
                    let ID = challenge.challengeId;
                    challengeList.push(challenge);
                    console.log(`Challenge ${ID} created for ${this.name}`);
                  } else {
                    console.log(challengeConfig);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
              console.log(`Challenge updates complete for ${this.name}`);
            }
            let newChallengeList = await Challenge.insertMany(challengeList);
            this.challengeData.categoryPoints =
              challengeData.data.categoryPoints;
            this.challengeData.totalPoints = challengeData.data.totalPoints;
            this.challengeData.preferences = challengeData.data.preferences;
            this.challengeData.challenges = newChallengeList;
          } catch (e) {}

          //gets all ranked league data from riot
          let rankedData = await getRankedDataBySummId(
            this.id,
            this.regionServer
          );
          if (
            rankedData.response !== undefined &&
            rankedData.response != null
          ) {
            return false;
          }
          this.rankedData = rankedData.data;

          await Mastery.deleteMany({
            _id: {
              $in: this.masteryData,
            },
          });

          //gets all champion mastery data from riot
          try {
            this.masteryData = [];
            let masteryList = [];
            let masteryData = await getMasteryByPuuid(
              this.puuid,
              this.regionServer
            );
            if (
              masteryData.response !== undefined &&
              masteryData.response != null
            ) {
              return false;
            } else {
              //creates new and updates existing mastery items for this summoner
              for (let mastery of masteryData.data) {
                try {
                  mastery.summonerName = this.name;
                  mastery.summonerId = this.id;
                  mastery.profileIconId = this.profileIconId;
                  mastery.uniqueId = this.puuid + '-' + mastery.championId;
                  //check if a mastery item with the same uniqueId exists within masteryList, if so, update it, if not, continue to push onto the list
                  let existingMastery = masteryList.find(m => m.uniqueId === mastery.uniqueId);
                  if (existingMastery) {
                    
                  } else {
                    masteryList.push(mastery);
                  }

                } catch (e) {
                  console.log(e);
                }
              }
              let newMasteryList = await Mastery.insertMany(masteryList);
              this.masteryData = newMasteryList;
              console.log(`Mastery updates complete for ${this.name}`);
            }
          } catch (e) {
            console.log(e);
          }
          return true;
        }
      },
      message: (props) =>
        `${props.value} is not a valid summoner name for this region!`,
    },
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
