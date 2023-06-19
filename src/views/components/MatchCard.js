import React from "react";
import {
  getRoleIcon,
  getChampIcon,
  getRoleName,
  getQueueName,
} from "../../utils/riotCDN";

const MatchCard = (props) => {
  const match = props.match;
  //get match name from match data, remove final s from name if it exists
  //remove last character s from match mode name if it exists
  const matchMode =
    getQueueName(match.info.queueId).slice(-5) === "games"
      ? getQueueName(match.info.queueId).slice(0, -5)
      : getQueueName(match.info.queueId);

  const focusedSummoners = props.focusedSummoners;
  //convert time stamp to date
  const date = new Date(match.info.gameCreation);

  // react component that lists both teams players and their champ icons, ordered by team and posisiton
  function MatchSummaryTeams(props) {
    const team100 = match.info.participants.filter(
      (participant) => participant.teamId === 100
    );
    const team200 = match.info.participants.filter(
      (participant) => participant.teamId === 200
    );

    const team100Players = team100.map((participant) => (
      <div
        className={"player " + getRoleName(participant.teamPosition)}
        key={participant.summonerName}
      >
        <img
          src={getChampIcon(participant.championId)}
          alt={participant.summonerName}
        />
        <div className="summoner-name">{participant.summonerName}</div>
      </div>
    ));

    const team200Players = team200.map((participant) => (
      <div
        className={"player " + getRoleName(participant.teamPosition)}
        key={participant.summonerName}
      >
        <img
          src={getChampIcon(participant.championId)}
          alt={participant.summonerName}
        />
        <div className="summoner-name">{participant.summonerName}</div>
      </div>
    ));

    //vertical list of league of legends postion icons in image format, in order of top, jungle, mid, bot, support. Not attached to either team's data
    const positionIcons = (
      <div className="position-icons">
        <img src={getRoleIcon("top")} alt="top" />
        <img src={getRoleIcon("jungle")} alt="jungle" />
        <img src={getRoleIcon("mid")} alt="mid" />
        <img src={getRoleIcon("bottom")} alt="bottom" />
        <img src={getRoleIcon("support")} alt="support" />
      </div>
    );

    return (
      <div className="match-summary-teams">
        <div className="team-list team-100">{team100Players}</div>
        {positionIcons}
        <div className="team-list team-200">{team200Players}</div>
      </div>
    );
  }

  // react component that lists match summary details for a focused summoner, extracted from match data
  function FocusedMatchSummary(props) {
    const summonerPuuid = props.summonerPuuid;

    //extracts summoner data from match data
    const summonerData = match.info.participants.filter(
      (participant) => participant.puuid === summonerPuuid
    )[0];

    //if summoner data is undefined, then the summoner was not in the match, so return nothing
    if (summonerData === undefined) {
      return <div></div>;
    }
    //extracts summoner name from summoner data
    const summonerName = summonerData.summonerName;

    const championId = summonerData.championId;
    const championName = summonerData.championName;
    const kills = summonerData.kills;
    const deaths = summonerData.deaths;
    const assists = summonerData.assists;
    const win = summonerData.win;
    const visionScore = summonerData.visionScore;
    const totalDamageDealtToChampions =
      summonerData.totalDamageDealtToChampions;
    const totalDamageTaken = summonerData.totalDamageTaken;
    const goldEarned = summonerData.goldEarned;
    const totalMinionsKilled = summonerData.totalMinionsKilled;
    const neutralMinionsKilled = summonerData.neutralMinionsKilled;
    const teamPosition = summonerData.teamPosition;

    return (
      <div className={"focused-match-summary " + (win ? "victory" : "defeat")}>
        <div className="champion-icon">
          <img src={getChampIcon(championId)} alt={championName} />
        </div>
        <div className="match-details">
          <div className="match-details-head">
            <div className="summoner-champ-wrapper">
              <div className="summoner-name">{summonerName}</div>
              <div>•</div>
              <div className="champion-name">{championName}</div>
              <div>{getRoleName(teamPosition) === "unnamed" ? "" : "•"}</div>
              <div className="team-position">
                {getRoleName(teamPosition) === "unnamed"
                  ? ""
                  : getRoleName(teamPosition)}
              </div>
              
              </div>
              <div className="win">{win ? "Victory" : "Defeat"}</div>
          </div>
          <div className="stats-wrapper">
            <div className="kda">
              {kills}/{deaths}/{assists}
            </div>
            <div className="vision-score">Vision: {visionScore}</div>
            <div className="gold-earned">Gold: {goldEarned}</div>
            <div className="total-minions-killed">CS: {totalMinionsKilled}</div>
          </div>
        </div>
      </div>
    );
  }

  //react component that lists match summary details for all focused summoners
  const FocusedMatchSummaries = focusedSummoners.map((summonerPuuid) => (
    <FocusedMatchSummary summonerPuuid={summonerPuuid} key={summonerPuuid} />
  ));

  return (
    <div className="match-card">
      <div className="match-card-header">
        <div className="queue-name">{matchMode}</div>
        <div className="match-card-header-date">
          {date.toLocaleDateString()}
        </div>
        <div className="match-card-header-duration">
          {Math.floor(match.info.gameDuration / 60)}:
          {match.info.gameDuration % 60 < 10
            ? "0" + (match.info.gameDuration % 60)
            : match.info.gameDuration % 60}
        </div>
      </div>
      <div className="match-summary">
        <div className="match-summary-focus">{FocusedMatchSummaries}</div>
        <div className="match-summary-team-list">
          <MatchSummaryTeams />
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
