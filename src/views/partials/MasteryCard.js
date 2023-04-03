import React from 'react';
import {getChampIcon,getChampName} from '../../utils/riotCDN';

const MasteryCard = (props) => {
  const mastery = props.mastery;
  return (
    <div className='mastery card-container'>
      <div className='mastery icon'><img alt = {mastery.championName + " icon"} src = {getChampIcon(mastery.championId)}></img></div>
      <div className = "champion-name">{getChampName(mastery.championId)}</div>
      <div className = "summoner-name">{mastery.summonerName}</div>
      <div className = "details">
        <div className = "mastery-name" >Mastery {mastery.championLevel}</div>
        <div className = "dot-spacer"></div>
        <div className = "percentile">{mastery.championPoints} points</div>
      </div>
    </div>
  );
};

export default MasteryCard;