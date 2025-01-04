export const gameDataUtils = {
    getSummonerIcon: (id) => {
        return `https://cdn.communitydragon.org/latest/profile-icon/${id}`;
    },

    getChallengeIcon: (id, rank) => {
        return `https://raw.communitydragon.org/latest/game/assets/challenges/config/${id}/tokens/${rank.toLowerCase()}.png`;
    },

    getChampIcon: (id) => {
        return `https://cdn.communitydragon.org/latest/champion/${id}/square`;
    },

    getChampSplash: (id) => {
        return `https://cdn.communitydragon.org/latest/champion/${id}/splash-art/centered/skin/0`;
    },

    getChampName: (id, champions) => {
        const championArray = Object.values(champions);
        const champion = championArray.find(c => parseInt(c.key) === parseInt(id));
        return champion ? champion.name : "unnamed";
    },

    getChampList: (champions) => champions,

    getChampArray: (champions) => Object.values(champions),

    getChampionDetails: (id, champions) => {
        id = id.replace(/\s/g, '').replace(/'/g, '');
        if (id === "BelVeth") id = "Belveth";
        return champions[id];
    },

    getRoleName: (id) => {
        const roleMap = {
            UTILITY: "Support",
            BOTTOM: "Bot",
            JUNGLE: "Jungle",
            TOP: "Top",
            MIDDLE: "Mid"
        };
        return roleMap[id] || "unnamed";
    },

    getRoleIcon: (id) => {
        if (id === undefined || id === "") {
            return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-middle.svg`;
        }
        return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-${id.toLowerCase()}.svg`;
    },

    getQueueName: (id, queues) => {
        const queue = queues.find(q => q.queueId === id);
        return queue ? queue.description : "any";
    },

    getItemIcon: (id, items) => {
        const item = items.find(i => parseInt(i.id) === id);
        if (item && item.iconPath) {
            const pathArray = item.iconPath.split("/lol-game-data/assets/");
            return "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/" + pathArray[1].toLowerCase();
        }
        return "unnamed";
    },

    getItemName: (id, items) => {
        const item = items.find(i => parseInt(i.id) === id);
        return item ? item.name : "unnamed";
    },

    getSpellIcon: (id) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${id}.png`;
    },

    getRuneIcon: (id) => {
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${id.style}.png`;
    },

    getPerkStyleIcon: (id) => {
        const perkName = gameDataUtils.getPerkStyleName(id);
        const perkFileName = gameDataUtils.getPerkStyleFileName(perkName);
        return `https://raw.communitydragon.org/latest/game/assets/perks/styles/${perkFileName}`;
    },

    getPerkStyleFileName: (name) => {
        const fileNames = {
            Precision: "7201_precision.png",
            Domination: "7200_domination.png",
            Sorcery: "7202_sorcery.png",
            Inspiration: "7203_whimsy.png",
            Resolve: "7204_resolve.png"
        };
        return fileNames[name] || "unnamed";
    },

    getPerkStyleName: (id) => {
        const perkNames = {
            8000: "Precision",
            8100: "Domination",
            8200: "Sorcery",
            8300: "Inspiration",
            8400: "Resolve"
        };
        return perkNames[id] || "unnamed";
    },

    getSummonerSpellIcon: (id) => {
        const spellFileName = gameDataUtils.getSummonerSpellFileName(id);
        return `https://raw.communitydragon.org/latest/game/data/spells/icons2d/${spellFileName}`;
    },

    getSummonerSpellFileName: (id) => {
        const spellFiles = {
            1: "summoner_boost.png",
            3: "summoner_exhaust.png",
            4: "summoner_flash.png",
            6: "summoner_haste.png",
            7: "summoner_heal.png",
            11: "summoner_smite.png",
            12: "summoner_teleport.png",
            13: "summonermana.png",
            14: "summonerignite.png",
            21: "summonerbarrier.png",
            30: "summoner_poro_recall.png",
            31: "summoner_poro_throw.png",
            32: "summoner_mark.png"
        };
        return spellFiles[id] || "unnamed";
    },

    getSummonerSpellName: (id) => {
        const spellNames = {
            1: "Cleanse",
            3: "Exhaust",
            4: "Flash",
            6: "Ghost",
            7: "Heal",
            11: "Smite",
            12: "Teleport",
            13: "Clarity",
            14: "Ignite",
            21: "Barrier",
            30: "To the King!",
            31: "Poro Toss",
            32: "Mark"
        };
        return spellNames[id] || "unnamed";
    },

    getRegionName: (id) => {
        const regionNames = {
            NA1: "na",
            EUN1: "eune",
            EUW1: "euw",
            KR: "kr",
            BR1: "br",
            LA1: "lan",
            LA2: "las",
            OC1: "oce",
            RU: "ru",
            TR1: "tr"
        };
        return regionNames[id] || "unnamed";
    },

    getDisplayNameFromQueueId: (id, queues) => {
        const queue = queues.find(q => q.queueId === id);
        if (queue) {
            if (queue.description.includes("ARAM")) return "ARAM";
            else if (queue.description.includes("Draft")) return "Draft";
            else if (queue.description.includes("Ranked Solo")) return "Ranked Solo";
            else if (queue.description.includes("Ranked Flex")) return "Ranked Flex";
            else if (queue.description.includes("URF")) return "URF";
            else if (queue.description.includes("ARURF")) return "ARURF";
            else if (queue.description.includes("Spellbook")) return "Summoner's Spellbook";
            else return "Other";
        }
        return "unnamed";
    },

    getDisplayNamesFromQueueIds: (ids, queues) => {
        let displayNames = [];
        ids.forEach(id => {
            const queue = queues.find(q => q.queueId === id);
            if (queue) {
                if (queue.description.includes("ARAM")) displayNames.push("ARAM");
                else if (queue.description.includes("Draft")) displayNames.push("Draft");
                else if (queue.description.includes("Ranked")) displayNames.push("Ranked");
                else if (queue.description.includes("URF")) displayNames.push("URF");
                else if (queue.description.includes("ARURF")) displayNames.push("ARURF");
                else if (queue.description.includes("Spellbook")) displayNames.push("Summoner's Spellbook");
                else displayNames.push("Other");
            }
        });
        return displayNames;
    },

    getQueueIdsFromDisplayNames: (names, queueMap) => {
        if (!queueMap) return ["0"];

        return names.flatMap(name => {
            switch (name) {
                case "ARAM": return queueMap.aram.map(queue => queue.queueId);
                case "Draft": return queueMap.draft.map(queue => queue.queueId);
                case "Ranked Solo": return queueMap.rankedSolo.map(queue => queue.queueId);
                case "Ranked Flex": return queueMap.rankedFlex.map(queue => queue.queueId);
                case "URF": return queueMap.urf.map(queue => queue.queueId);
                case "ARURF": return queueMap.arurf.map(queue => queue.queueId);
                case "Summoner's Spellbook": return queueMap.spellbook.map(queue => queue.queueId);
                default: return ["0"];
            }
        });
    }
};
