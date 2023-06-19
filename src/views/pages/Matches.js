
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ShowMatchList from "../partials/ShowMatchList";
import SummonerStats from "../partials/SummonerStats";

function Matches(props) {
    const { champ, mode, role, page } = useParams();
  
    function SubPage() {
          return(
          <section>
            <h2>Match History</h2>
            <ShowMatchList champ = {champ} mode = {mode} role = {role}/>
          </section>
          );      
      }
   
    return (
      <div className="page">
        <section className={`${page}`}>
        <h2>Matches</h2>
        <SummonerStats/> 
        <SubPage/>
        </section>
      </div>
    );
  }
  
  export default Matches;
