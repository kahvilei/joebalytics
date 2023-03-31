import React from 'react';
import { Link } from 'react-router-dom';


const SummonerCard = (props) => {
  const summoner = props.summoner;

  return (
    <div className='card-container'>
      <div className = "summoner-icon"><img alt = "summoner icon" src = {`http://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/${summoner.profileIconId}.png`}></img></div>
      <div className='desc'>
        <div className = "name-and-rank">
          <p>
            <Link to={`/summoner/${summoner.regionURL}/${summoner.nameURL}`}>{summoner.name}</Link>
          </p>
        </div>
        <p>Level {summoner.summonerLevel}</p>
      </div>
    </div>
  );
};

export default SummonerCard;