import React from "react";
import { Link } from "react-router-dom";
import {getSummonerIcon} from "../../utils/riotCDN";

const MatchCard = (props) => {
  const match = props.match;

  return (
    <div
      className="match-card"
    >
      {match.metadata.matchId}
    </div>
  );
};

export default MatchCard;
