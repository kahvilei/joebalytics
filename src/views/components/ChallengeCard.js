import React from "react";
import { useGameData } from "../../context/DataContext";

const ChallengeCard = (props) => {
  const { getChallengeIcon } = useGameData();
  const challenge = props.challenge;
  const rank = props.rank;
  const mode = props.mode;
  const name = props.name;

  const challengePercentile = (challenge.percentile === 0) ? "Max (Top 0%)" : `Top ${(challenge.percentile * 100).toFixed(2)}%`

  if (mode === "listing" && name === undefined) {
    return (
      <div className="challenge card-container">
        <div>
          <div className="challenge rank">{rank}</div>
          <div className="challenge icon">
            <img
              alt={challenge.challengeName + " icon"}
              src={getChallengeIcon(challenge.challengeId, challenge.level)}
            ></img>
          </div>
          <div className="summoner-name">{challenge.summonerName}</div>
          <div className="challenge-name">
            {challenge.challengeName}
          </div>
          <div className="challenge-desc" dangerouslySetInnerHTML={{__html: challenge.shortDesc}}>
          </div>
        </div>
        <div>
          <div className="percentile">
          {challengePercentile}
          </div>
        </div>
      </div>
    );
  } else if (mode === "listing" && name !== undefined) {
    return (
      <div className="challenge card-container">
        <div>
          <div className="challenge rank">{rank}</div>
          <div className="challenge icon">
            <img
              alt={challenge.challengeName + " icon"}
              src={getChallengeIcon(challenge.challengeId, challenge.level)}
            ></img>
          </div>
          <div className="challenge-name">
            {challenge.challengeName}
          </div>
          <div className="challenge-desc" dangerouslySetInnerHTML={{__html: challenge.shortDesc}}>
          </div>
        </div>
        <div>
          <div className="percentile">
          {challengePercentile}
          </div>
        </div>
      </div>
    );
  } else if (mode !== "listing" && name === undefined) {
    return (
      <div className="challenge card-container">
        <div className="challenge rank">{rank}</div>
        <div className="challenge icon">
          <img
            alt={challenge.challengeName + " icon"}
            src={getChallengeIcon(challenge.challengeId, challenge.level)}
          ></img>
        </div>
        <div className="details">
          <div className="summoner-name">{challenge.summonerName}</div>
          <div className="challenge-name" title={challenge.shortDesc}>
            {challenge.challengeName}
          </div>
          <div className="percentile">
          {challengePercentile}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="challenge card-container">
        <div className="challenge rank">{rank}</div>
        <div className="challenge icon">
          <img
            alt={challenge.challengeName + " icon"}
            src={getChallengeIcon(challenge.challengeId, challenge.level)}
          ></img>
        </div>
        <div className="details">
          <div className="challenge-name" title={challenge.shortDesc}>
            {challenge.challengeName}
          </div>
          <div className="percentile">
          {challengePercentile}
          </div>
        </div>
      </div>
    );
  }
};

export default ChallengeCard;
