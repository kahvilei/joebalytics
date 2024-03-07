import React, { useState, useEffect } from 'react';

import ChampionDetailsCard from '../components/ChampionDetailsCard';
import LoadingCircle from '../components/LoadingCircle';

import { rootAddress } from '../../config/config';
import { getChampArray } from '../../utils/riotCDN';

function ChampionDetailsList(props) {
    const [champions, setChampions] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    
    useEffect(() => {
        setIsLoading(true);
        let champList = getChampArray();
        setChampions(champList);
        setIsLoading(false);
    }, []);
    
    const champList = champions.length === 0 ? '' : champions.map((champion, k) => <ChampionDetailsCard champion={champion} key={k} />);
    
    if(isLoading){
        return (  
        <div className='ChampionDetailsList'>
            <LoadingCircle color = {"dark"} aspectRatio = {"square"}/>
        </div>
        );
    }else{
        return (  
        <div className='ChampionDetailsList'>
            <div className='list'>{champList}</div>    
        </div>
        );
    }
}

export default ChampionDetailsList;