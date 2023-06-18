import { rootAddress } from "../../config/config";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import MatchCard from "../components/MatchCard";
import LoadingCircle from "../components/LoadingCircle";

function ShowMatchList(props) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  let { region, name } = useParams();

  const [focusedSummoners, setFocusedSummoners] = useState([]);

  if (region === undefined || name === undefined) {
    region = "any";
    name = "any";
  } else {
  }

  const [searchParams, setSearchParams] = useSearchParams({});

  const [mode, setMode] = useState(
    searchParams.get("mode") ? searchParams.get("mode") : "any"
  );

  const [role, setRole] = useState(
    searchParams.get("role") ? searchParams.get("role") : "any"
  );

  const [champ, setChamp] = useState(
    parseInt(searchParams.get("champ"))
      ? parseInt(searchParams.get("champ"))
      : "any"
  );

  useEffect(() => {
    setIsLoading(true);
    //gets list of matches to display in match list
    //TODO: add load more feature -- will have to configure on server side as well
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/recent/10/populate/${region}/${name}/${champ}/${role}/${mode}`
      )
      .then((res) => {
        setMatches(res.data);
      })
      .catch((err) => {
        console.log("Error from match list");
      });
    //gets list of focused summoer puuids to display in focus on each card, if this is an unfiltered list than this will be all summoners tracked on the site, otherwise, it will just be one.
    if (region === "any" && name === "any") {
      axios
        .get(rootAddress[process.env.NODE_ENV] + `/api/summoners/`)
        .then((res) => {
          //extracts puuids from summoner objects
          const puuids = res.data.map((summoner) => summoner.puuid);
          setFocusedSummoners(puuids);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Error from set focused summoners");
        });
    } else {
      axios
        .get(
          rootAddress[process.env.NODE_ENV] + `/api/summoners/${region}/${name}`
        )
        .then((res) => {
          //extracts puuid from single summoner object in response
          setFocusedSummoners([res.data.puuid]);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Error from set focused summoners");
        });
    }
  }, [champ, mode, name, region, role]);

  //load more function, that loads 10 more matches after the earliest timestamp in the current list.
  function loadMore(){
    const earliestTimestamp = matches[matches.length-1].timestamp;
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/recent/${earliestTimestamp}/10/populate/${region}/${name}/${champ}/${role}/${mode}`
      )
      .then((res) => {
        setMatches(matches.concat(res.data));
      })
      .catch((err) => {
        console.log("Error from match list");
      });
  }

  const matchList =
    matches.length === 0
      ? ""
      : matches.map((match, k) => (
          <MatchCard
            focusedSummoners={focusedSummoners}
            match={match}
            key={k}
          />
        ));

  if (isLoading) {
    return (
      <div className="match-list">
        <LoadingCircle color={"dark"} aspectRatio={"rectangle"} />
      </div>
    );
  } else {
    return (
      <div className="match-list-wrapper">
        <div className="match-list">
          <div className="list">{matchList}</div>
        </div>
        <div className="load-more">
          <button onClick = {loadMore}>Load More</button>
        </div>
      </div>
    );
  }
}

export default ShowMatchList;
