import React from "react";
import { Link } from "react-router-dom";
import { useGameData } from "../../context/DataContext";

const SummonerCard = (props) => {
  const { getSummonerIcon } = useGameData();
  const summoner = props.summoner;
  let tier = "unranked";
  let rank = "";
  if (summoner.rankedData[0]) {
    if (summoner.rankedData[0].tier){
      tier = summoner.rankedData[0].tier.toLowerCase();
      rank = summoner.rankedData[0].rank;
    }else if(summoner.rankedData[1]){
      if(summoner.rankedData[1].tier){
      tier = summoner.rankedData[1].tier.toLowerCase();
      rank = summoner.rankedData[1].rank;
    }
  }
    
  }
  return (
    <Link
      className="card-link"
      to={`/summoner/${summoner.regionURL}/${summoner.nameURL}`}
    >
      <div className="card-container">
        <div className="summoner-icon">
          <img
            alt="summoner icon"
            src={getSummonerIcon(summoner.profileIconId)}
          ></img>
        </div>
        <div className="desc">
          <div className="name-and-rank">
            <div className="summoner-name">{summoner.name}</div>
            <div className={`rank ${tier}`}>
              <div className="circle"></div>
              <div>{rank}</div>
            </div>
          </div>
          <div className="summoner-level">Level {summoner.summonerLevel}</div>
        </div>
      </div>
    </Link>
  );
};

export default SummonerCard;
