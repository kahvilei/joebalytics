import React from "react";
import { useParams } from "react-router-dom";
import ShowMatchList from "../partials/ShowMatchList";
import SummonerStats from "../partials/SummonerStats";

function Matches(props) {
  const { champ, mode, role, page } = useParams();

  function SubPage() {
    return (
      <ShowMatchList
        infiniteScroll={true}
        champ={champ}
        mode={mode}
        role={role}
      />
    );
  }

  return (
    <div className="page">
      <section className={`${page}`}>
        <h1>Match History</h1>
        <SummonerStats />
        <SubPage />
      </section>
    </div>
  );
}

export default Matches;
