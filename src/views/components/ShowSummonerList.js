import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummonerCard from '../partials/SummonerCard';


function ShowSummonerList() {
  const [summoners, setSummoners] = useState([]);

  useEffect(() => {
    axios
      .get('/api/summoners')
      .then((res) => {
        setSummoners(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowSummonerList');
      });
  }, []);

  const summonerList =
    summoners.length === 0
      ? ''
      : summoners.map((summoner, k) => <SummonerCard summoner={summoner} key={k} />);

  return (
    <div className='ShowSummonerList'>
        <div className='list'>{summonerList}</div>
    </div>
  );
}

export default ShowSummonerList;