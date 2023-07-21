import { rootAddress } from "../../config/config";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import MatchCard from "../components/MatchCard";
import SkeletonLoader from "../components/SkeletonLoader";  

function ShowMatchList(props) {
  const limit = props.count ? props.count : 10;
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  //const [loadMoreToggle, setLoadMoreToggle] = useState(props.loadMore? props.loadMore : true);
  const [infinteScroll, setInfiniteScroll] = useState(props.infiniteScroll? props.infiniteScroll : false);
  const [moretoLoad, setMoreToLoad] = useState(true);

  let { region, name } = useParams();

  const [focusedSummoners, setFocusedSummoners] = useState([]);

  if (region === undefined || name === undefined) {
    region = "any";
    name = "any";
  } else {
  }

  const [searchParams] = useSearchParams({});

  const [mode] = useState(
    searchParams.get("mode") ? searchParams.get("mode") : "any"
  );

  const [role] = useState(
    searchParams.get("role") ? searchParams.get("role") : "any"
  );

  const [champ] = useState(
    parseInt(searchParams.get("champ"))
      ? parseInt(searchParams.get("champ"))
      : "any"
  );
   
  const loadMore = async () =>{
    if(moretoLoad){ 
      let earliestTimestamp;
      if(matches.length === 0){
        earliestTimestamp = Date.now();
      }else{
        earliestTimestamp = matches[matches.length-1].info.gameStartTimestamp;
      }
    setIsLoading(true);
    axios
      .get(
        rootAddress[process.env.NODE_ENV] +
          `/api/matches/recent/${earliestTimestamp}/${limit}/populate/${region}/${name}/${champ}/${role}/${mode}`
      )
      .then((res) => {
        setMatches(matches.concat(res.data));
        if(res.data.length < 1 || !infinteScroll){
          setMoreToLoad(false);
          setInfiniteScroll(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error from match list");
      });
    }
  }

  useEffect(() => {

    loadMore();
    
    if (region === "any" && name === "any") {
      axios
        .get(rootAddress[process.env.NODE_ENV] + `/api/summoners/`)
        .then((res) => {
          //extracts puuids from summoner objects
          const puuids = res.data.map((summoner) => summoner.puuid);
          setFocusedSummoners(puuids);
          
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
          
        })
        .catch((err) => {
          console.log("Error from set focused summoners");
        });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [champ, limit, mode, name, region, role]);

  const handleScroll = () => {
    let scroll = window.innerHeight + document.documentElement.scrollTop;
    let height = document.documentElement.offsetHeight
    if (scroll+2 <= height || isLoading) {
      return;
    }
    loadMore();
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  //component that displays a load more button if there are more matches to load
  // const loadMoreButton = moretoLoad && loadMoreToggle && !infinteScroll ? <div className="load-more"><button onClick = {loadMore}>Load More</button></div> : <div></div>

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

    return (
      <div className="match-list-wrapper">
        <div className="match-list">
          <div className="list">{matchList}</div>
        </div>
        {isLoading && <SkeletonLoader/>}
      </div>
    );
}

export default ShowMatchList;
