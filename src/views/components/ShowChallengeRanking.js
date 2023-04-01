import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChallengeCard from '../partials/ChallengeCard';



function ShowSummonerList() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    axios
      .get('/api/challenges/top/8')
      .then((res) => {
        setChallenges(res.data);
      })
      .catch((err) => {
        console.log('Error from challenge ranking');
      });
  }, []);

  const challengeRank =
  challenges.length === 0
      ? ''
      : challenges.map((challenge, k) => <ChallengeCard challenge={challenge} key={k} rank={k+1}/>);

  return (
    <div className='challenge-ranking'>
        <div className='list'>{challengeRank}</div>
    </div>
  );
}

export default ShowSummonerList;