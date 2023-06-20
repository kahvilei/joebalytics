import React from "react";
import {
  getRoleIcon,
  getChampIcon,
  getRoleName,
  getQueueName,
  getSummonerIcon,
  getItemIcon,
  getItemName,
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

    //get team 100 win status
    const team100Win = team100[0].win;

    //get team 200 win status
    const team200Win = team200[0].win;

    //team100 kills, deaths
    const team100Kills = team100.reduce(
      (total, participant) => total + participant.kills,
      0
    );
    const team100Deaths = team100.reduce(
      (total, participant) => total + participant.deaths,
      0
    );

    //team100 kills, deaths
    const team200Kills = team200.reduce(
      (total, participant) => total + participant.kills,
      0
    );
    const team200Deaths = team200.reduce(
      (total, participant) => total + participant.deaths,
      0
    );

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
      <div className="match-summary-team-section">
        <div className="match-summary-head">
          <div className="kd">
            <div
              className={"blue kills " + (team100Win ? "victory" : "defeat")}
            >
              {team100Kills}
            </div>
            <div className="versus">vs.</div>
            <div className={"red kills " + (team200Win ? "victory" : "defeat")}>
              {team200Kills}
            </div>
          </div>
        </div>
        <div className="match-summary-teams">
          <div className="team blue">
            <div className="team-list team-100">{team100Players}</div>
          </div>
          {positionIcons}
          <div className="team red">
            <div className="team-list team-200">{team200Players}</div>
          </div>
        </div>
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

    //turn minion kills into localized number format
    summonerData.totalMinionsKilled =
      summonerData.totalMinionsKilled.toLocaleString();

    //turn gold earned into string, ex: 12345 -> 12.3k, 123 -> 123, 123456 -> 123k

    if (summonerData.goldEarned >= 1000000) {
      summonerData.goldEarnedSumm =
        Math.floor(summonerData.goldEarned / 1000000) + "m";
    } else if (summonerData.goldEarned >= 1000) {
      //keep 1 decimal place
      summonerData.goldEarnedSumm =
        Math.floor(summonerData.goldEarned / 100) / 10 + "k";
    } else {
      summonerData.goldEarnedSumm = summonerData.goldEarned.toLocaleString();
    }

    //react component that displays a players k/d/a and their kda score (kills + assists / deaths)
    function PlayerKda(props) {
      const summoner = props.summoner;
      const score =
        summoner.deaths === 0
          ? ((summoner.kills + summoner.assists) / 1).toFixed(1)
          : ((summoner.kills + summoner.assists) / summoner.deaths).toFixed(1);

      // add a tag "bad" to kda score if it is less than 3.0, good if it is greater than 4.0, and nueutral if it is between 3.0 and 4.0
      const kdaTag = score < 3.0 ? "bad" : score > 4.0 ? "good" : "neutral";

      return (
        <div className="player-kda">
          <div className="kda">
            {summoner.kills} / {summoner.deaths} / {summoner.assists}
          </div>
          <div className="kda-score">
            <span className={kdaTag}>{score}</span>
            KDA
          </div>
        </div>
      );
    }

    //react component that displays total cs and cs per minute, as well as gold earned and gold per minute, and finally wards placed with wards placed per minute and wards destroyed
    function PlayerCsGoldVs(props) {
      const summoner = props.summoner;

      //total cs = minions killed + neutral minions killed
      const totalCs =
        parseInt(summoner.totalMinionsKilled) +
        parseInt(summoner.neutralMinionsKilled);
      const csPerMinute = (totalCs / (match.info.gameDuration / 60)).toFixed(1);
      const wardsPlacedPerMinute = (
        parseInt(summoner.wardsPlaced) /
        (match.info.gameDuration / 60)
      ).toFixed(1);

      const goldPerMinute = (
        parseInt(summoner.goldEarned) /
        (match.info.gameDuration / 60)
      ).toFixed(1);
      return (
        <div className="player-cs-and-gold">
          <div className="player-cs">
            <div className="total-cs">
              {totalCs} ({csPerMinute}) CS
            </div>
            <div className="tooltip cs-tooltip">Total CS (CS per minute)</div>
          </div>
          <div className="gold-earned">
            {summoner.goldEarnedSumm} ({goldPerMinute}) Gold
            <div className="tooltip gold-tooltip">Total Gold (Gold per minute)</div>
          </div>
          <div className="wards-placed">
            {summoner.wardsPlaced} ({wardsPlacedPerMinute}) /{" "}
            {summoner.wardsKilled}
            <div className="tooltip ward-tooltip">Total wards places (Wards per minute) / Wards destroyed</div>
          </div>
        </div>
      );
    }

    //react component that displays kill participation and damage dealt to champions
    function PlayerDamageAndKillParticipation(props) {
      const summoner = props.summoner;
      const killParticipation = (
        summoner.challenges.killParticipation * 100
      ).toFixed(0);
      //tag kill participation as good if it is greater than 60%, bad if it is less than 40%, and neutral if it is between 40% and 60%
      const killParticipationTag =
        killParticipation < 40
          ? "bad"
          : killParticipation > 60
          ? "good"
          : "neutral";
      return (
        <div className="player-damage-and-kill-participation">
          <div className={"kill-participation " + killParticipationTag}>
            {killParticipation}% KP
          </div>
          <div className="damage-to-champions">
            {summoner.totalDamageDealtToChampions.toLocaleString()} Damage
          </div>
        </div>
      );
    }

    //react component that displays a 2*3 grid of the summoner's item icons, accounting for empty item slots. Each item should display it's own name on hover for accessibility
    function PlayerItems(props) {
      const summoner = props.summoner;
      const itemIcons = [];
      const itemNumber = summoner.itemNumber;
      for (let i = 0; i <= 6; i++) {
        if (summoner[`item${i}`] !== undefined && summoner[`item${i}`] !== 0) {
          itemIcons.push(
            <div className={"item-icon " + summoner[`item${i}`]} key={i}>
              <img
                src={getItemIcon(summoner[`item${i}`])}
                alt={summoner[`item${i}`]}
              />
              <div
                className="item-dec"
                dangerouslySetInnerHTML={{
                  __html: getItemName(summoner[`item${i}`]),
                }}
              ></div>
            </div>
          );
        } else {
          itemIcons.push(<div className={"item-icon " + summoner[`item${i}`]} key={i}>
          <div
            alt={'blank icon'}
            className="blank-icon"
          />
          <div
            className="item-dec"
          ></div>
        </div>);
        }
      }
      return <div className="player-items">{itemIcons}</div>;
    }

    return (
      <div
        className={
          "focused-match-summary " + (summonerData.win ? "victory" : "defeat")
        }
      >
        <div className="champion-icon">
          <img
            src={getChampIcon(summonerData.championId)}
            alt={summonerData.championName}
          />
        </div>
        <div className="match-details">
          <div className="match-details-head">
            <div className="summoner-champ-wrapper">
              <div className="summoner-icon">
                <img
                  src={getSummonerIcon(summonerData.profileIcon)}
                  alt={summonerData.summonerName}
                />
              </div>
              <div className="summoner-name">{summonerData.summonerName}</div>
              <div>•</div>
              <div className="champion-name">{summonerData.championName}</div>
              <div>
                {getRoleName(summonerData.teamPosition) === "unnamed"
                  ? ""
                  : "•"}
              </div>
              <div className="team-position">
                {getRoleName(summonerData.teamPosition) === "unnamed"
                  ? ""
                  : getRoleName(summonerData.teamPosition)}
              </div>
            </div>
            <div className="win">{summonerData.win ? "Victory" : "Defeat"}</div>
          </div>
          <div className="stats-wrapper">
            <PlayerKda summoner={summonerData} />
            <PlayerDamageAndKillParticipation summoner={summonerData} />
            <PlayerCsGoldVs summoner={summonerData} />
            <PlayerItems summoner={summonerData} />
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
