const data = require('./championInfo.json');
const champions = data.data;

const getSummonerIcon = (id) => {
    return `https://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/${id}.png`
}

const getChallengeIcon = (id, rank) =>{
    return `https://raw.communitydragon.org/latest/game/assets/challenges/config/${id}/tokens/${rank.toLowerCase()}.png`
}

const getChampIcon = (id) =>{
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`
}

const getChampName = (id) =>{
    for (let champion in champions){
        if(parseInt(champions[champion].key) === id){
            return champions[champion].name;
        }
    }
    return "unnamed";
}

export { getChallengeIcon, getSummonerIcon, getChampIcon, getChampName};