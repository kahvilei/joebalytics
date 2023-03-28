const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {
    getMasteryBySummId,
    getRankedDataBySummId,
    getSummonerDetails,
    getSummonerDetailsByPuuid,
    recordRecentMatches,
    getChallengeDataByPuuid,
} = require("../controllers/riot");
const { regionMapping } = require("../config/regionMapping");
// Load Mastery model
const Mastery = require("./Mastery");
const Participant = require("./Participant");

const SummonerSchema = new Schema({
    regionDisplay: {
        type: String,
        required: true,
    },
    regionServer: String,
    regionGeo: String,
    regionURL: String,
    nameURL: String,
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

                let response;
                let init = false; //this determines whether or not this is treated as a first time save
                //if the puuid already exists, we will use it to query riot's servers
                if (this.puuid != null) {
                    response = await getSummonerDetailsByPuuid(
                        this.puuid,
                        this.regionServer
                    );
                } else {
                    //if not, we will find user info using the region and summoner name
                    init = true;
                    response = await getSummonerDetails(this.name, this.regionServer);
                }

                if (response.status !== 200) {
                    console.log("unable to find summoner based on values provided");
                    return "unable to find summoner based on values provided";
                } else {
                    //set main values based on riot response
                    this.id = response.data.id;
                    this.accountId = response.data.accountId;
                    this.puuid = response.data.puuid;
                    this.name = response.data.name;
                    this.profileIconId = response.data.profileIconId;
                    this.revisionDate = response.data.revisionDate;
                    this.summonerLevel = response.data.summonerLevel;

                    this.regionURL = this.regionDisplay.toLowerCase();
                    this.nameURL = this.name.toLowerCase().replaceAll(" ", "-");

                    //update update time to now
                    let currentDate = new Date();
                    let timestamp = currentDate.getTime();
                    this.lastUpdated = timestamp;

                    //records all user matches from the last match added matching this user's puuid to now, if this is the first save, it loads 20 games
                    await recordRecentMatches(this.puuid, this.regionGeo, init);

                    //gets all challenge data from riot
                    let challengeData = await getChallengeDataByPuuid(
                        this.puuid,
                        this.regionServer
                    );
                    if (
                        challengeData.response != undefined &&
                        challengeData.response != null
                    ) {
                        return false;
                    }
                    this.challengeData = challengeData.data;

                    //gets all ranked league data from riot
                    let rankedData = await getRankedDataBySummId(
                        this.id,
                        this.regionServer
                    );
                    if (rankedData.response != undefined && rankedData.response != null) {
                        return false;
                    }
                    this.rankedData = rankedData.data;

                    //gets all champion mastery data from riot
                    let masteryData = await getMasteryBySummId(
                        this.id,
                        this.regionServer
                    );
                    if (
                        masteryData.response != undefined &&
                        masteryData.response != null
                    ) {
                        return false;
                    } else {//creates new and updates existing mastery items for this summoner
                        for (let mastery of masteryData.data) {
                            let exists = await Mastery.findOne({
                                $and: [
                                    { championId: mastery.championId },
                                    { summonerId: mastery.summonerId },
                                ],
                            });
                            if (exists) {
                                let oldScore = exists.championPoints;
                                let newScore = mastery.championPoints;
                                let ID = exists.championId;
                                if (oldScore !== newScore) {
                                    let pastGames = await Participant.find({
                                        $and: [
                                            { championId: mastery.championId },
                                            { summonerId: mastery.summonerId },
                                        ],
                                    });
                                    mastery.gamesPlayed = pastGames.length;
                                    if(pastGames.length > 5){
                                        let counter = 0;
                                        for(let game in pastGames){
                                            counter += game.win ? 1 : 0;
                                        }
                                        mastery.winRate = counter/pastGames.length;
                                    }
                                    
                                    await Mastery.findByIdAndUpdate(exists._id, mastery);
                                    console.log(`Mastery updated for champ ${ID}`);
                                }
                            } else {
                                let pastGames = await Participant.find({
                                    $and: [
                                        { championId: mastery.championId },
                                        { summonerId: mastery.summonerId },
                                    ],
                                });
                                mastery.gamesPlayed = pastGames.length;
                                if(pastGames.length > 5){
                                    let counter = 0;
                                    for(let game of pastGames){
                                        counter += game.win ? 1 : 0;
                                    }
                                    mastery.winRate = counter/pastGames.length;
                                }
                                
                                let newMastery = await Mastery.create(mastery);
                                this.masteryData.push(newMastery);
                                console.log(
                                    `Mastery creation complete for champ ${newMastery.championId}`
                                );
                            }
                        }
                        console.log(`Mastery updates complete for ${this.name}`);
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
                challengeId: Number,
                percentile: Number,
                level: String,
                value: Number,
                achievedTime: Number,
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
        }
    }
);

module.exports = mongoose.model("Summoner", SummonerSchema);
