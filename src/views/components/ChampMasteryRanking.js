//displays masteries earned by all summoners for a single champ. champ info is passed down as a prop. Mastery info is fetched from the server.
//
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";
import { rootAddress } from '../../config/config';
import SkeletonLoader from '../components/SkeletonLoader';

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

    if(isLoading){
        return (  
        <div className='ChampMasteryRanking'>
            <SkeletonLoader/>
        </div>
        );
    }else{
        return (  
        <div className='ChampMasteryRanking'>
            <h2>Champion Mastery Ranking for {champion.name}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Summoner</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {masteryRanking.map((summoner, index) => {
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{summoner.summonerName}</td>
                                <td>{summoner.championPoints}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        );
    }
}

export default ChampMasteryRanking;