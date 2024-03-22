//displays masteries earned by all summoners for a single champ. champ info is passed down as a prop. Mastery info is fetched from the server.
//
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import axios from "axios";
import { rootAddress } from '../../config/config';
import LoadingCircle from './LoadingCircle';
import { getSummonerIcon } from '../../utils/riotCDN';

function ChampMasteryRanking(props) {
    const champion = props.champion;
    const id = champion.key;
    const masteryRanking = champion.mastery;

    // returns a numbers of div elements depending on the number of tokens the summoner has for the champion
    const tokenDisplay = (tokens, masteryLevel, currentPoints) => {
        const tokensNeeded = masteryLevel === 6 ? 3 : masteryLevel === 7 ? 0 : masteryLevel === 5 ? 2 : 0;
        const pointsNeeded = masteryLevel === 1 ? 1800 : masteryLevel === 2 ? 6000 : masteryLevel === 3 ? 12600 : masteryLevel === 4 ? 21600 : 0;
        const pointsRemaining = pointsNeeded - currentPoints;
        //calculate points needed in between current level and next level
        const pointScale = pointsNeeded - (masteryLevel === 1 ? 0 : masteryLevel === 2 ? 1800 : masteryLevel === 3 ? 6000 : masteryLevel === 4 ? 12600 : 21600);

        //calculate current percentage of points needed to reach next level
        const percentage = pointsRemaining / pointScale;
        if(masteryLevel === 7){
            return (
                <div className='points-bar'>
                    <div className="points-needed" key={0}>Max Mastery</div>
                </div>
            );
        }
        let tokenArray = [];
        let i = 0;
        for(i = 0; i < tokens; i++){
            tokenArray.push(<div className="token" key={i}></div>);
        }
        const tokensMissing = tokensNeeded - tokens;
        const currentCount = i;
        for(i = 0; i < tokensMissing; i++){
            tokenArray.push(<div className="token null" key={currentCount + i}></div>);
        }
        if(tokensNeeded === 0){
            tokenArray.push(
            <div className='points-bar'> 
            <div className="scale">
            <div className="bar" style={{width: `${100 - (percentage * 100)}%`}}></div>
            </div>
            <div className="points-needed" key={0}>{pointsRemaining} points remaining</div>
            </div>
            );
        }
        return tokenArray;
    }
    const isMastered = (masteryLevel) => {
        if(masteryLevel === 7){
            return 'mastered';
        }else{
            return 'not-mastered';
        }
    }
    return (  
    <div className='ChampMasteryRanking'>
                {masteryRanking.map((summoner, index) => {
                    return (
                        <div className={"mastery-card summoner " + isMastered(summoner.championLevel)} key={index}>
                            <img src={getSummonerIcon(summoner.profileIconId)} alt={summoner.summonerName} />
                            <div className = "summoner-name">{summoner.summonerName}</div>
                            <div className='tokens'>{tokenDisplay(summoner.tokensEarned, summoner.championLevel, summoner.championPoints)}</div>
                            <div className='mastery'>Mastery {summoner.championLevel}</div>
                            <div className='points'>{summoner.championPoints} points</div>
                        </div>
                    );
                })}
    </div>
    );
    
    
}

export default ChampMasteryRanking;