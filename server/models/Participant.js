const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const path = require('path');

const yaml = require('js-yaml');
const { Storage } = require('@google-cloud/storage');
const { type } = require("os");
const storage = new Storage();
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

async function generateParticipantSchema() {

  // Get the YAML content
  const [tags] = await bucket.file("data/tags/tags.yaml").download();
  // Generate GraphQL type for individual tag fields
  const config = yaml.load(tags.toString());
  // Base schema definition
  const ParticipantSchema = new Schema({
    uniqueId: {
      type: String,
      unique: true
    },
    gameMode: {
      type: String,
      default: 'NORMAL-TEST',
      required: [true, "gameMode required"],
    },
    gameStartTimestamp: Number,
    matchId: String,
    allInPings: Number,
    assistMePings: Number,
    assists: Number,
    baitPings: Number,
    baronKills: Number,
    basicPings: Number,
    bountyLevel: Number,
    queueId: Number,
    challenges: {
      type: Map,
      of: Schema.Types.Mixed
    },
    champExperience: Number,
    champLevel: Number,
    championId: Number,
    championName: String,
    championTransform: Number,
    commandPings: Number,
    consumablesPurchased: Number,
    damageDealtToBuildings: Number,
    damageDealtToObjectives: Number,
    damageDealtToTurrets: Number,
    damageSelfMitigated: Number,
    dangerPings: Number,
    deaths: Number,
    detectorWardsPlaced: Number,
    doubleKills: Number,
    dragonKills: Number,
    eligibleForProgression: Boolean,
    enemyMissingPings: Number,
    enemyVisionPings: Number,
    firstBloodAssist: Boolean,
    firstBloodKill: Boolean,
    firstTowerAssist: Boolean,
    firstTowerKill: Boolean,
    gameEndedInEarlySurrender: Boolean,
    gameEndedInSurrender: Boolean,
    getBackPings: Number,
    goldEarned: Number,
    goldSpent: Number,
    holdPings: Number,
    individualPosition: String,
    inhibitorKills: Number,
    inhibitorTakedowns: Number,
    inhibitorsLost: Number,
    itemNumber: Number,
    item0: Number,
    item1: Number,
    item2: Number,
    item3: Number,
    item4: Number,
    item5: Number,
    item6: Number,
    itemsPurchased: Number,
    killingSprees: Number,
    kills: Number,
    lane: String,
    largestCriticalStrike: Number,
    largestKillingSpree: Number,
    largestMultiKill: Number,
    longestTimeSpentLiving: Number,
    magicDamageDealt: Number,
    magicDamageDealtToChampions: Number,
    magicDamageTaken: Number,
    missions: {
      type: Map,
      of: Number
    },
    needVisionPings: Number,
    neutralMinionsKilled: Number,
    nexusKills: Number,
    nexusLost: Number,
    nexusTakedowns: Number,
    objectivesStolen: Number,
    objectivesStolenAssists: Number,
    onMyWayPings: Number,
    participantId: Number,
    pentaKills: Number,
    perks: {
      statPerks: {
        defense: Number,
        flex: Number,
        offense: Number,
      },
      styles: [
        {
          description: String,
          selections: [
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
          ],
          style: Number,
        },
        {
          description: String,
          selections: [
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
            {
              perk: Number,
              var1: Number,
              var2: Number,
              var3: Number,
            },
          ],
          style: Number,
        },
      ],
    },
    physicalDamageDealt: Number,
    physicalDamageDealtToChampions: Number,
    physicalDamageTaken: Number,
    profileIcon: Number,
    pushPings: Number,
    puuid: String,
    quadraKills: Number,
    riotIdGameName: String,
    riotIdTagline: String,
    role: String,
    sightWardsBoughtInGame: Number,
    spell1Casts: Number,
    spell2Casts: Number,
    spell3Casts: Number,
    spell4Casts: Number,
    summoner1Casts: Number,
    summoner1Id: Number,
    summoner2Casts: Number,
    summoner2Id: Number,
    summonerId: String,
    summonerLevel: Number,
    summonerName: String,
    teamEarlySurrendered: Boolean,
    teamId: Number,
    teamPosition: String,
    timeCCingOthers: Number,
    timePlayed: Number,
    tagsVersion: Number,
    tags: {
      type: Map,
      of: {
        type: {
          isTriggered: {
            type: Boolean,
            default: false
          },
          value: {
            type: Number,
            default: 0
          }
        }
      }
    },
    totalDamageDealt: Number,
    totalDamageDealtToChampions: Number,
    totalDamageShieldedOnTeammates: Number,
    totalDamageTaken: Number,
    totalHeal: Number,
    totalHealsOnTeammates: Number,
    totalMinionsKilled: Number,
    totalTimeCCDealt: Number,
    totalTimeSpentDead: Number,
    totalUnitsHealed: Number,
    tripleKills: Number,
    trueDamageDealt: Number,
    trueDamageDealtToChampions: Number,
    trueDamageTaken: Number,
    turretKills: Number,
    turretTakedowns: Number,
    turretsLost: Number,
    unrealKills: Number,
    visionClearedPings: Number,
    visionScore: Number,
    visionWardsBoughtInGame: Number,
    wardsKilled: Number,
    wardsPlaced: Number,
    win: Boolean,
  });

  ParticipantSchema.index({ matchId: 1 });
  ParticipantSchema.index({ puuid: 1 });
  ParticipantSchema.index({ championId: 1 });
  ParticipantSchema.index({ gameStartTimestamp: -1 });
  ParticipantSchema.index({ gameMode: 1 });
  ParticipantSchema.index({ win: 1 });
  ParticipantSchema.index({ role: 1 });
  ParticipantSchema.index({ queueId: 1 });

  //compound indexes 
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, championId: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, queueId: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, role: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, championId: 1, role: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, queueId: 1, role: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, championId: 1, queueId: 1 });
  ParticipantSchema.index({ puuid: 1, gameStartTimestamp: -1, championId: 1, queueId: 1, role: 1 });

  if (config.tags) {
    for (const tag of config.tags) {
      // Create index for isTriggered field
      ParticipantSchema.index({ [`tags.${tag.key}.isTriggered`]: 1 });

      // Create index for value field if the tag has value in its triggers or a value property
      if (tag.value || (tag.triggers && tag.triggers.some(t => t.includes('value')))) {
        ParticipantSchema.index({ [`tags.${tag.key}.value`]: 1 });
      }
    }
  }

  return ParticipantSchema;
}

module.exports = {
  generateParticipantSchema,
  // Export a function to create the model once the schema is generated
  createParticipantModel: async () => {
    const schema = await generateParticipantSchema();
    return mongoose.model("Participant", schema);
  }
};