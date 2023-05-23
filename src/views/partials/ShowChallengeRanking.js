import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ChallengeCard from "../components/ChallengeCard";
import LoadingCircle from "../components/LoadingCircle";

function ShowChallengeRanking(props) {
  const [challenges, setChallenges] = useState([]);
  let getRequest = rootAddress[process.env.NODE_ENV] + `/api/challenges/top/${props.count}`;
  const [isLoading, setIsLoading] = useState([]);

  const { region, name } = useParams();

  const mode = props.mode;

  if (name) {
    getRequest = rootAddress[process.env.NODE_ENV] + `/api/challenges/top/${
      props.count
    }/${region.toLowerCase()}/${name.toLowerCase()}`;
  }
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(getRequest)
      .then((res) => {
        setChallenges(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error from challenge ranking");
      });
  }, [getRequest]);

  const ChallengeRank = () => {
    let list = [];
    let k = 0;
    for (let challenge of challenges) {
      if (challenge.level !== "NONE" && parseInt(challenge.challengeId) > 5) {
        list.push(
          <ChallengeCard
            mode={mode}
            challenge={challenge}
            name={name}
            key={k}
            rank={k + 1}
          />
        );
        k++;
      }
    }
    return list;
  };

  if (isLoading) {
    return (
      <div className="mastery-ranking">
        <LoadingCircle color={"dark"} aspectRatio={"short-rectangle"} />
      </div>
    );
  } else {
    return (
      <div className={`challenge-ranking ${mode}`}>
        <div className="list">
          <ChallengeRank />
        </div>
      </div>
    );
  }
}

export default ShowChallengeRanking;
