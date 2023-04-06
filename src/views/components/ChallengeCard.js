import React from 'react';
import {getChallengeIcon} from '../../utils/riotCDN';

const ChallengeCard = (props) => {
  const challenge = props.challenge;
  const rank = props.rank;
  return (
    <div className='challenge card-container'>
      <div className='challenge rank'>{rank}</div>
      <div className='challenge icon'><img alt = {challenge.challengeName + " icon"} src = {getChallengeIcon(challenge.challengeId, challenge.level)}></img></div>
      <div className = "details">
        <div className = "summoner-name">{challenge.summonerName}</div>
        <div className = "challenge-name" title = {challenge.shortDesc}>{challenge.challengeName}</div>
        <div className = "percentile">Top {(challenge.percentile*100).toFixed(2)}%</div>
      </div>
    </div>
  );
};

export default ChallengeCard;