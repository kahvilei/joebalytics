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

//getPerkStyleIcon,getPerkStyleName,

const getPerkStyleIcon = (id) =>{
    //translate perk id to perk name, example: 8000 -> Precision
    const perkName = getPerkStyleName(id);
    //translate perk name to communitydragon file name, example: Precision -> 7201_precision.png, Domination -> 7200_domination.png , Sorcery -> 7202_sorcery.png , Inspiration -> 7203_inspiration.png , Resolve -> 7204_resolve.png
    const perkFileName = getPerkStyleFileName(perkName);
    
    return `https://raw.communitydragon.org/latest/game/assets/perks/styles/` + perkFileName;
}

const getPerkStyleFileName = (name) =>{
    if(name === "Precision"){
        return "7201_precision.png";
    }
    if(name === "Domination"){
        return "7200_domination.png";
    }
    if(name === "Sorcery"){
        return "7202_sorcery.png";
    }
    if(name === "Inspiration"){
        return "7203_whimsy.png";
    }
    if(name === "Resolve"){
        return "7204_resolve.png";
    }
    return "unnamed";
}

const getPerkStyleName = (id) =>{
    if(id === 8000){
        return "Precision";
    }
    if(id === 8100){
        return "Domination";
    }
    if(id === 8200){
        return "Sorcery";
    }
    if(id === 8300){
        return "Inspiration";
    }
    if(id === 8400){
        return "Resolve";
    }
    return "unnamed";
}

//getSummonerSpellIcon,getSummonerSpellName,

const getSummonerSpellIcon = (id) =>{
    //get summoner spell icons from communitydragon
    //convert id to communitydragon file name
    const spellFileName = getSummonerSpellFileName(id);
    return `https://raw.communitydragon.org/latest/game/data/spells/icons2d/` + spellFileName;

}

const getSummonerSpellFileName = (id) =>{
    if(id === 1){
        return "summoner_boost.png";
    }
    if(id === 3){
        return "summoner_exhaust.png";
    }
    if(id === 4){
        return "summoner_flash.png";
    }
    if(id === 6){
        return "summoner_haste.png";
    }
    if(id === 7){
        return "summoner_heal.png";
    }
    if(id === 11){
        return "summoner_smite.png";
    }
    if(id === 12){
        return "summoner_teleport.png";
    }
    if(id === 13){
        return "summonermana.png";
    }
    if(id === 14){
        return "summonerignite.png";
    }
    if(id === 21){
        return "summonerbarrier.png";
    }
    if(id === 30){
        return "summoner_poro_recall.png";
    }
    if(id === 31){
        return "summoner_poro_throw.png";
    }
    if(id === 32){
        return "summoner_mark.png";
    }
    return "unnamed";
}
const getSummonerSpellName = (id) =>{

    //convert id to summoner spell name
    if(id === 1){
        return "Cleanse";
    }
    if(id === 3){
        return "Exhaust";
    }
    if(id === 4){
        return "Flash";
    }
    if(id === 6){
        return "Ghost";
    }
    if(id === 7){
        return "Heal";
    }
    if(id === 11){
        return "Smite";
    }
    if(id === 12){
        return "Teleport";
    }
    if(id === 13){
        return "Clarity";
    }
    if(id === 14){
        return "Ignite";
    }
    if(id === 21){
        return "Barrier";
    }
    if(id === 30){
        return "To the King!";
    }
    if(id === 31){
        return "Poro Toss";
    }
    if(id === 32){
        return "Mark";
    }
    return "unnamed";
    
}


export { getChallengeIcon, getSummonerIcon, getChampIcon, getChampName, getQueueName, getRoleName, getRoleIcon, getItemIcon, getSpellIcon, getRuneIcon, getItemName, getPerkStyleIcon, getPerkStyleName, getSummonerSpellIcon, getSummonerSpellName};