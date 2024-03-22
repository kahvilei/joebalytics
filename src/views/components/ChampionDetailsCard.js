//displays champion details for a league champion - including icon, name, and title. All info is passed down as a prop

import React from 'react';
import { Link } from 'react-router-dom';
import { rootAddress } from '../../config/config';
import { getChampIcon, getChampSplash } from '../../utils/riotCDN';
import ChampMasteryRanking  from './ChampMasteryRanking';
import RadarChart from './RadarChart';
import Scale from './Scale';

function ChampionDetailsCard(props) {
    const {champion} = props;
    const champIcon = getChampSplash(champion.key);
    const champPlayStyle = [champion.info.attack, champion.info.defense, champion.info.magic];
    const champPlayStyleLabels = ['Attack', 'Defense', 'Magic'];
    return (
        <Link to={`/champion/${champion.key}`} className='ChampionDetailsCard'>
            <div style = {{backgroundImage: "url(" + champIcon + ")"}} className='splash'>
                <div className='overlay-gradient'></div>
            </div>
            <div className='details'>
                <div className='champ-info'>
                <div>
                <h2>{champion.name}</h2>
                <h3>{champion.title}</h3>
                <div className='champ-stats'>
                    <Scale max={10} value={champion.info.difficulty} label='Difficulty'/>
                </div></div>
                <RadarChart max={10} height={250} scores={champPlayStyle} labels={champPlayStyleLabels}/>
                </div>
                <ChampMasteryRanking champion={champion}/>
            </div>
        </Link>
    );
}

export default ChampionDetailsCard;