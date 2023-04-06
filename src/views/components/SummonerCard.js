import React from "react";
import { Link } from "react-router-dom";
import {getSummonerIcon} from "../../utils/riotCDN";

const SummonerCard = (props) => {
  const summoner = props.summoner;
  let tier = "unranked";
  let rank = "";
  if (summoner.rankedData[0]) {
    tier = summoner.rankedData[0].tier.toLowerCase();
    rank = summoner.rankedData[0].rank;
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
