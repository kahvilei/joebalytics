const getSummonerIcon = (id) => {
    return `http://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/${id}.png`
}

const getChallengeIcon = (id, rank) =>{
    return `https://raw.communitydragon.org/latest/game/assets/challenges/config/${id}/tokens/${rank.toLowerCase()}.png`
}

export { getChallengeIcon, getSummonerIcon };