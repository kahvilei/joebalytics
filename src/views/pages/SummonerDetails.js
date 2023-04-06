import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import ShowChallengeRanking from "../partials/ShowChallengeRanking";
import ShowMasteryRanking from "../partials/ShowMasteryRanking";
import { modelNames } from "mongoose";

function SummonerDetails(props) {
  const { region, name } = useParams();

  return (
    <div className="summoner page">
      <section>
        <h2>Challenges Ranking</h2>
        <ShowChallengeRanking name = {name} region = {region} count={12} />
      </section>
      <section>
        <h2>Champion Masteries</h2>
        <ShowMasteryRanking name = {name} region = {region} count={8} />
      </section>
    </div>
  );
}

export default SummonerDetails;
