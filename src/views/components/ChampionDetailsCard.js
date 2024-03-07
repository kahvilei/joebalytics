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
            <div className='splash'>
                <img src={champIcon} alt={champion.name} />
            </div>
            <div className='details'>
                <h3>{champion.name}</h3>
                <p>{champion.title}</p>
                <ChampMasteryRanking champion={champion}/>
            </div>
        </Link>
    );
}

export default ChampionDetailsCard;