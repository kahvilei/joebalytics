import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SummonerCard from './partials/SummonerCard';


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
      ? 'there is no summoner record!'
      : summoners.map((summoner, k) => <SummonerCard summoner={summoner} key={k} />);

  return (
    <div className='ShowSummonerList'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <br />
            <h2 className='display-4 text-center'>Summoners List</h2>
          </div>

          <div className='col-md-11'>
            <Link
              to='/add-summoner'
              className='btn btn-outline-warning float-right'
            >
              + Add New Summoner
            </Link>
            <br />
            <br />
            <hr />
          </div>
        </div>

        <div className='list'>{summonerList}</div>
      </div>
    </div>
  );
}

export default ShowSummonerList;