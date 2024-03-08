import React, { useState, useEffect } from 'react';

import ChampionDetailsCard from '../components/ChampionDetailsCard';
import LoadingCircle from '../components/LoadingCircle';

import { getChampArray } from '../../utils/riotCDN';


function ChampionDetailsList(props) {
    const [champions, setChampions] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    
    const initChampList = getChampArray();
    
    useEffect(() => {
        setIsLoading(true);
        let champList = getChampArray();
        setChampions(champList);
        setIsLoading(false);
    }, []);
    
    const champList = champions.length === 0 ? '' : champions.map((champion, k) => <ChampionDetailsCard champion={champion} key={k} />);
    //function that sets list of champions to be displayed based on the current search query, takes in a string. hides and unhides elements based on the query
    const setChampListByQuery = (query) => {
        if(query === ''){
            setChampions(initChampList.map((champion, k) => champion));
            
        }else{
            setChampions(initChampList.filter(champion => champion.name.toLowerCase().includes(query.toLowerCase())).map((champion, k) => champion));
        }
    }
    
    if(isLoading){
        return (  
        <div className='ChampionDetailsList'>
            <LoadingCircle color = {"dark"} aspectRatio = {"square"}/>
        </div>
        );
    }else{
        return (  
        <div className='ChampionDetailsList'>
            <input type='text' placeholder='Search' onChange={(e) => setChampListByQuery(e.target.value)} />
            <div className='list'>{champList}</div>    
        </div>
        );
    }
}

export default ChampionDetailsList;