import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MasteryCard from '../partials/MasteryCard';



function ShowMasteryRanking(props) {
  const [masteries, setMasteries] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/masteries/top/${props.count}`)
      .then((res) => {
        setMasteries(res.data);
      })
      .catch((err) => {
        console.log('Error from mastery ranking');
      });
  }, []);

  const masteryRank =
  masteries.length === 0
      ? ''
      : masteries.map((mastery, k) => <MasteryCard mastery={mastery} key={k} rank={k+1}/>);

  return (
    <div className='mastery-ranking'>
        <div className='list'>{masteryRank}</div>
    </div>
  );
}

export default ShowMasteryRanking;