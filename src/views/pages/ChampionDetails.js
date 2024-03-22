// detailed champions page that includes all available champion information for a single champion, followed by mastery levels for all summoners, and recent matches with the champion.

import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { getChampionDetails, getChampName, getChampIcon, getChampSplash } from '../../utils/riotCDN';
import ChampMasteryRanking  from '../components/ChampMasteryRanking';
import RadarChart from '../components/RadarChart';
import Scale from '../components/Scale';
import ShowMatchList from '../partials/ShowMatchList';

function ChampionDetails(props) {
    const { id } = useParams();
    const [champion, setChampion] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    let champIcon = getChampSplash(id);
    const champPlayStyle = champion.length === 0 ? [] : [champion.info.attack, champion.info.defense, champion.info.magic];
    const champPlayStyleLabels = ['Attack', 'Defense', 'Magic'];    

    useEffect(() => {
        setIsLoading(true);
        let champName = getChampName(id);
        let champDetails = getChampionDetails(champName);
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
            <section className='full-width'>
        <div className='ChampionDetails'>
            <div style = {{backgroundImage: "url(" + champIcon + ")"}} className='splash'>
                <div className='overlay-gradient'></div>
            </div>
            <div className='details'>
                <div className='champ-info'>
                <div>
                <h1>{champion.name}</h1>
                <h3>{champion.title}</h3>
                <div className='champ-stats'>
                    <Scale max={10} value={champion.info.difficulty} label='Difficulty'/>
                </div></div>
                <RadarChart max={10} height={250} scores={champPlayStyle} labels={champPlayStyleLabels}/>
                </div>
                <ChampMasteryRanking champion={champion}/>
            </div>
        </div>
        <section>
            <h2>Recent Matches</h2>
            <ShowMatchList infiniteScroll={true} champ = {champion.key} mode = {'any'} role = {'any'}/>
        </section>
        </section>
        );
    }
}

export default ChampionDetails;