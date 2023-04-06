import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummonerCard from '../components/SummonerCard';
import LoadingCircle from '../components/LoadingCircle';


function ShowSummonerList(props) {
  const [summoners, setSummoners] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get('/api/summoners')
      .then((res) => {
        setSummoners(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('Error from ShowSummonerList');
      });
  }, []);

  const summonerList =
    summoners.length === 0
      ? ''
      : summoners.map((summoner, k) => <SummonerCard summoner={summoner} key={k} />);

  if(isLoading){
    return (  
      <div className='ShowSummonerList'>
          <LoadingCircle color = {"dark"} aspectRatio = {"square"}/>
      </div>
    );
  }else{
    return (  
      <div className='ShowSummonerList'>
          <div className='list'>{summonerList}</div>    
      </div>
    );
  }
}

export default ShowSummonerList;