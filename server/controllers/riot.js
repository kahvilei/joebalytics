const axios = require("axios");

const { processTags } = require('./tags');
//internal
const { cache: data } = require('../controllers/data');

const key = process.env.RIOT_KEY;

// Load Match model
const { models } = require("mongoose");

const getSummonerDetails = async (name, region) => {
  return axios.get(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${key}`
  );
};

const getSummonerDetailsByPuuid = async (puuid, region) => {
  return axios.get(
    `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${key}`
  );
};

const getSummonerTaglineByPuuid = async (puuid, region) => {
  return axios.get(
    `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${key}`
  );
};

const getChallengeDataByPuuid = async (puuid, region) => {
  return await axios.get(
    `https://${region}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}?api_key=${key}`
  );
};

const getChallengeConfig = async () => {
  return await axios.get(`https://na1.api.riotgames.com/lol/challenges/v1/challenges/config?api_key=${key}`)
}

const getRankedDataBySummId = async (id, region) => {
  return await axios.get(
    `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${key}`
  );
};

const getMasteryByPuuid = async (id, region) => {
  return await axios.get(
    `https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${id}?api_key=${key}`
  );
};

const recordRecentMatches = async (puuid, region, init) => {
  let mostRecent = await models.Match.find({ "metadata.participants": puuid })
    .sort({ "info.gameEndTimestamp": -1 })
    .limit(1);
  let games = init
    ? "start=0&count=50"
    : mostRecent.length > 0
      ? `startTime=${removeDigits(mostRecent[0].info.gameEndTimestamp, 3)}`
      : "start=0&count=50";

  let response = await axios.get(
    `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?${games}&api_key=${key}`
  );

  console.log(response);

  let matchList = await collectMatchDataFromArray(region, response.data);

  //for each participant found in match.info.participants, run the util funnction to calculate tags and save to the participant

  if (matchList.length > 0) {
    //insert matches one at a time, so that if one fails, the others will still be added, and we can delete the 10 participants that were added
    for (let match of matchList) {
      try {
        await models.Match.create(match);
      } catch (err) {
        //delete the 10 participants that were added, avoiding dups and loose participants
        for (let participant of match.info.participants) {
          try{
          await models.Participant.deleteOne({ _id: participant._id });
          } catch (err) {
            console.log(err);
          }
      }
        console.log(err);
      }
    }
    console.log(`${matchList.length} matches added successfully`);
    return `${matchList.length} matches added successfully`;
  } else {
    console.log(`No new matches to add`);
    return `No new matches to add`;
  }
};

const collectMatchDataFromArray = async (region, list) => {
  let matchList = [];
  const Participant = models.Participant;
  for (let match of list) {
    const exists = await models.Match.find({ "metadata.matchId": match });
    if (exists.length === 0) {
      try {
        let res = await axios.get(
          `https://${region}.api.riotgames.com/lol/match/v5/matches/${match}?api_key=${key}`
        );
        let matchData = res.data;
        let newParticipantList = [];
        const focusedSummoners = data.summoners.map(s => s.puuid);
        for (let participant of matchData.info.participants) {
          participant.matchId = matchData.metadata.matchId;
          participant.gameMode = matchData.info.gameMode;
          participant.queueId = matchData.info.queueId;
          participant.gameStartTimestamp = matchData.info.gameStartTimestamp;
          participant.uniqueId = matchData.metadata.matchId + participant.puuid;
          if (focusedSummoners.includes(participant.puuid)) {
            participant.tags = processTags(participant, matchData);
            participant.tagsVersion = data.tagCurrentVersion.id;
          } else {
            participant.tags = {};
          }
          let newParticipant = await Participant.create(participant);
          newParticipantList.push(newParticipant);
        }

        matchData.info.participants = newParticipantList;

        matchList.push(matchData);
      } catch (err) {
        console.log(err);
      }
    }
  }
  return matchList;
};

const removeDigits = (x, n) => {
  return (x - (x % Math.pow(10, n))) / Math.pow(10, n);
};

//this function is not currently in use, but may be useful in the future. Deletes all matches associated with a summoner but not associated with any other watched summoners
// const removeMatchesByPuuid = async (puuid, allSumms) => {
//   let toLeave = [];
//   for (summoner in AllSumms) {
//     toLeave.push(summoner.puuid);
//   }
//   let toDelete = await Match.find({
//     $and: [
//       { "metadata.participants": puuid },
//       { "metadata.participants": { $nin: toLeave } },
//     ],
//   });
//   return toDelete;
// };

module.exports = {
  getMasteryByPuuid,
  getRankedDataBySummId,
  getChallengeDataByPuuid,
  getSummonerDetails,
  recordRecentMatches,
  getSummonerDetailsByPuuid,
  getChallengeConfig,
  getSummonerTaglineByPuuid,
};
