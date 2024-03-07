//displays champion details for a league champion - including icon, name, and title. All info is passed down as a prop

import React from 'react';
import { Link } from 'react-router-dom';
import { rootAddress } from '../../config/config';
import { getChampIcon, getChampSplash } from '../../utils/riotCDN';
import ChampMasteryRanking  from './ChampMasteryRanking';

function ChampionDetailsCard(props) {
    const {champion} = props;
    const champIcon = getChampSplash(champion.key);
    return (
        <Link to={`/champion/${champion.id}`} className='ChampionDetailsCard'>
            <div style = {{backgroundImage: "url(" + champIcon + ")"}} className='splash'>
                <div className='overlay-gradient'></div>
            </div>
            <div className='details'>
                <h2>{champion.name}</h2>
                <h3>{champion.title}</h3>
                <ChampMasteryRanking champion={champion}/>
            </div>
        </Link>
    );
}

export default ChampionDetailsCard;