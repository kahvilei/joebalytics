import React from 'react';
import { useGameData } from '../../context/DataContext';

const MasteryCard = (props) => {
  const {getChampIcon,getChampName} = useGameData();
  const mastery = props.mastery;
  return (
    <a href = {"/champion/" + mastery.championId} className='mastery card-container'>
      <div className='mastery icon'><img alt = {mastery.championName + " icon"} src = {getChampIcon(mastery.championId)}></img></div>
      <div className = "champion-name">{getChampName(mastery.championId)}</div>
      <div className = "summoner-name">{mastery.summonerName}</div>
      <div className = "details">
        <div className = "mastery-name" >Mastery {mastery.championLevel}</div>
        <div className = "dot-spacer"></div>
        <div className = "percentile">{mastery.championPoints.toLocaleString()} points</div>
      </div>
    </a>
  );
};

export default MasteryCard;