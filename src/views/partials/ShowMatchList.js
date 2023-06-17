import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams} from "react-router-dom";
import axios from 'axios';
import MatchCard from '../components/MatchCard';
import LoadingCircle from '../components/LoadingCircle';


function ShowMatchList(props) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const { region, name } = useParams();

  const [searchParams, setSearchParams] = useSearchParams({});

  const [mode, setMode] = useState(searchParams.get('mode')?searchParams.get('mode'):'any');

  const [role, setRole] = useState(searchParams.get('role')?searchParams.get('role'):'any');

  const [champ, setChamp] = useState(parseInt(searchParams.get('champ'))?parseInt(searchParams.get('champ')):'any');


  useEffect(() => {
    setIsLoading(true);
    axios
      .get(rootAddress[process.env.NODE_ENV] + `/api/matches/recent/10/populate/${region}/${name}/${champ}/${role}/${mode}`)
      .then((res) => {
        setMatches(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('Error from match list');
      });
  }, []);

  const matchList =
    matches.length === 0
      ? ''
      : matches.map((match, k) => <MatchCard match={match} key={k} />);

  if(isLoading){
    return (  
      <div className='match-list'>
          <LoadingCircle color = {"dark"} aspectRatio = {"rectangle"}/>
      </div>
    );
  }else{
    return (  
      <div className='match-list'>
          <div className='list'>{matchList}</div>    
      </div>
    );
  }
}

export default ShowMatchList;