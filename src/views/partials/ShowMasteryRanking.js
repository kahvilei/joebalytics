import {rootAddress} from '../../config/config';

import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from 'axios';
import MasteryCard from '../components/MasteryCard';
import LoadingCircle from '../components/LoadingCircle';



function ShowMasteryRanking(props) {
  const [masteries, setMasteries] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  let getRequest = rootAddress[process.env.NODE_ENV] + `/api/masteries/top/${props.count}`;

  const { region, name } = useParams();

  if(name){
    getRequest = rootAddress[process.env.NODE_ENV] + `/api/masteries/top/${props.count}/${region.toLowerCase()}/${name.toLowerCase()}`;
  }

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(getRequest)
      .then((res) => {
        setMasteries(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('Error from mastery ranking');
      });
  }, [getRequest]);

  const masteryRank =
  masteries.length === 0
      ? ''
      : masteries.map((mastery, k) => <MasteryCard mastery={mastery} key={k} rank={k+1}/>);

 if(isLoading){
  return (
    <div className='mastery-ranking'>
        <LoadingCircle color = {"dark"} aspectRatio = {"short-rectangle"}/>
    </div>
  );
  }else{
    return (  
     <div className='mastery-ranking'>
       <div className='list'>{masteryRank}</div>
       </div>
    );
  }
}

export default ShowMasteryRanking;