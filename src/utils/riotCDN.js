const champtionData = require('./championInfo.json');
const champions = champtionData.data;

const queueData = require('./queueInfo.json');
const queues = queueData.data;

const itemData = require('./itemInfo.json');
const items = itemData;

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
        return "Bot";
    }
    if(id === "JUNGLE"){
        return "Jungle";
    }
    if(id === "TOP"){
        return "Top";
    }
    if(id === "MIDDLE"){
        return "Mid";
    }
    return "unnamed";
}

const getRoleIcon = (id) =>{
    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-career-stats/global/default/images/position_${id}.png`
}

const getQueueName = (id) =>{
    for (let queue in queues){
        if(parseInt(queues[queue].queueId) === id){
            return queues[queue].description;
        }
    }
    return "any";
}


const getItemIcon = (id) =>{
    for (let item in items){
        if(parseInt(items[item].id) === id){
            //path is items[item].iconPath - /lol-game-data/assets/
            const path = items[item].iconPath;
            const pathArray = path.split("/lol-game-data/assets/");
            return "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/" + pathArray[1].toLowerCase();
        }
    }
    return "unnamed";
}

const getItemName = (id) =>{
    for (let item in items){
        if(parseInt(items[item].id) === id){
            return items[item].name;
        }
    }
    return "unnamed";
}

const getSpellIcon = (id) =>{
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`
}

const getRuneIcon = (id) =>{
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${id.style}.png`
}



export { getChallengeIcon, getSummonerIcon, getChampIcon, getChampName, getQueueName, getRoleName, getRoleIcon, getItemIcon, getSpellIcon, getRuneIcon, getItemName};