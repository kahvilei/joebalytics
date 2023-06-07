const champtionData = require('./championInfo.json');
const champions = champtionData.data;

const queueData = require('./queueInfo.json');
const queues = queueData.data;

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

const getRoleName = (id) =>{
    if(id === "UTILITY"){
        return "Support";
    }
    if(id === "BOTTOM"){
        return "Bottom";
    }
    if(id === "JUNGLE"){
        return "Jungle";
    }
    if(id === "TOP"){
        return "Top";
    }
    if(id === "MIDDLE"){
        return "Middle";
    }
    return "unnamed";
}

const getQueueName = (id) =>{
    for (let queue in queues){
        if(parseInt(queues[queue].queueId) === id){
            return queues[queue].description;
        }
    }
    return "any";
}

export { getChallengeIcon, getSummonerIcon, getChampIcon, getChampName, getQueueName, getRoleName};