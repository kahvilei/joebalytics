// detailed champions page that includes all available champion information for a single champion, followed by mastery levels for all summoners, and recent matches with the champion.

import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { getChampionDetails, getChampIcon, getChampSplash } from '../../utils/riotCDN';

function ChampionDetails(props) {
    const { id } = useParams();
    const [champion, setChampion] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    
    useEffect(() => {
        setIsLoading(true);
        let champDetails = getChampionDetails(id);
        setChampion(champDetails);
        setIsLoading(false);
    }, [id]);
    
    if(isLoading){
        return (  
        <div className='ChampionDetails'>
            <div>Loading...</div>
        </div>
        );
    }else{
        return (  
        <div className='ChampionDetails'>
            <h2>{champion.name}</h2>
            <img src={getChampSplash(champion.key)} alt={champion.name} />
            <p>{champion.title}</p>
        </div>
        );
    }
}

export default ChampionDetails;