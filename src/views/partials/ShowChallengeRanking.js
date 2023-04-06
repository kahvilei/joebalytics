import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChallengeCard from '../components/ChallengeCard';
import LoadingCircle from '../components/LoadingCircle';



function ShowChallengeRanking(props) {
  const [challenges, setChallenges] = useState([]);
  let getRequest = `/api/challenges/top/${props.count}`;
  const [isLoading, setIsLoading] = useState([]);

  if(props.name){
    getRequest = `/api/challenges/top/${props.count}/${props.region.toLowerCase()}/${props.name.toLowerCase()}`;
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
        console.log('Error from challenge ranking');
      });
  }, [getRequest]);

  const challengeRank =
  challenges.length === 0
      ? ''
      : challenges.map((challenge, k) => <ChallengeCard challenge={challenge} key={k} rank={k+1}/>);

if(isLoading){
  return (
    <div className='mastery-ranking'>
        <LoadingCircle color = {"dark"} aspectRatio = {"short-rectangle"}/>
    </div>
  );
}else{
  return (
    <div className='challenge-ranking'>
        <div className='list'>{challengeRank}</div>
    </div>
  );
}

}

export default ShowChallengeRanking;