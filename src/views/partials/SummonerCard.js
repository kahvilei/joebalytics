import React from 'react';
import { Link } from 'react-router-dom';


const SummonerCard = (props) => {
  const summoner = props.summoner;

  return (
    <div className='card-container'>
      <div className='desc'>
        <h2>
          <Link to={`/summoner/${summoner.regionURL}/${summoner.nameURL}`}>{summoner.name}</Link>
        </h2>
        <h3>{summoner.regionDisplay}</h3>
      </div>
    </div>
  );
};

export default SummonerCard;