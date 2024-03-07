//displays masteries earned by all summoners for a single champ. champ info is passed down as a prop. Mastery info is fetched from the server.
//
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";
import { rootAddress } from '../../config/config';
import LoadingCircle from './LoadingCircle';
import { getSummonerIcon } from '../../utils/riotCDN';

function ChampMasteryRanking(props) {
    const [masteryRanking, setMasteryRanking] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    const champion = props.champion;
    const id = champion.key;
    
    useEffect(() => {
        setIsLoading(true);
        axios.get(rootAddress[process.env.NODE_ENV] + `/api/masteries/champion/${id}`)
        .then((res) => {
            setMasteryRanking(res.data);
            setIsLoading(false);
        });
    }, [id]);

    // returns a numbers of div elements depending on the number of tokens the summoner has for the champion
    const tokenDisplay = (tokens) => {
        let tokenArray = [];
        for(let i = 0; i < tokens; i++){
            tokenArray.push(<div className="token" key={i}></div>);
        }
        return tokenArray;
    }

    if(isLoading){
        return (  
        <div className='ChampMasteryRanking'>
            <LoadingCircle/>
        </div>
        );
    }else{
        return (  
        <div className='ChampMasteryRanking'>
                    {masteryRanking.map((summoner, index) => {
                        return (
                            <div className="mastery-card summoner" key={index}>
                                <img src={getSummonerIcon(summoner.profileIconId)} alt={summoner.summonerName} />
                                <div>{summoner.summonerName}</div>
                                <div className='tokens'>{tokenDisplay(summoner.tokensEarned)}</div>
                                <div>Mastery {summoner.championLevel}</div>
                                <div>{summoner.championPoints} points</div>
                            </div>
                        );
                    })}
        </div>
        );
    }
    
    
}

export default ChampMasteryRanking;