import React from "react";
import { useParams } from "react-router-dom";
import ChampionDetailsList from "../partials/ChampionDetailsList";
import SummonerStats from "../partials/SummonerStats";

function Champions(props) {
  const { page } = useParams();

  function SubPage() {
    return (
     <ChampionDetailsList/>
    );
  }

  return (
    <div className="page">
      <section className={`${page}`}>
        <h2>Champions</h2>
        <SubPage />
      </section>
    </div>
  );
}

export default Champions;
