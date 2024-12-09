import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { get, set } from 'mongoose';
import { Container, Loader, Stack } from '@mantine/core';

const GAME_DATA_QUERY = gql`
  query GameData {
    gameData {
      champions {
        data
        version
        type
        format
      }
      items {
        id
        name
        description
        iconPath
      }
      summonerSpells {
        data
        version
        type
      }
      queueTypes {
        queueId
        map
        description
      }
      tagData {
        precalcs{
          name
          type
          from {
            list
            type
            path
            conditions 
          }
          list
          value
          conditions 
        }
        tags{
          key
          text
          color
          description
          triggers
          value
        }
      }
    }
    summoners {
      id
      name
      regionDisplay
      regionURL
      tagline
      profileIconId
      puuid
      summonerLevel
      rankedData {
        tier
        rank
        leaguePoints
      }
    }
  }
`;

const MATCHES_PAGE_QUERY = gql`
 query MatchesPageData(
    $region: String
    $names: [String!]
    $roles: [String!]
    $championIds: [Int!]
    $queueIds: [Int!]
    $limit: Int
    $timestamp: Float
    $tags: [String!]
  ) {
    matches(
      region: $region
      summonerNames: $names
      roles: $roles
      championIds: $championIds
      queueIds: $queueIds
      limit: $limit
      timestamp: $timestamp
      tags: $tags
    ) {
      metadata {
        matchId
        participants
      }
      info {
        gameMode
        gameStartTimestamp
        gameDuration
        platformId
        queueId
        gameCreation

        participants {
          teamPosition
          championId
          championName
          kills
          deaths
          assists
          win
          summonerName
          puuid
          teamId
          riotIdTagline
          riotIdGameName

          totalMinionsKilled
          neutralMinionsKilled
          goldEarned
          totalDamageDealtToChampions
          visionScore
          wardsPlaced
          wardsKilled

          gameEndedInEarlySurrender
          gameEndedInSurrender

          challenges {
            killParticipation
            kda
            visionScorePerMinute
          }

          tags {
            blind {
              isTriggered
              value
            }
          }
        }
      }
    }
  }
`;

const TAG_VERSIONS_QUERY = gql`
  query TagVersions{
    tagFileVersions{
      id
      user
    }
    tagCurrentVersion{
      id
      user
    }
    tagLastBackFill {
      id
      user
      results {
        total
        success
        failed
        errors
      }
    }
  }
`;

const UPDATE_TAGS_MUTATION = gql`
  mutation UpdateTagData($file: String!) {
    updateTagData(file: $file) {
      message
      success
    }
  }
`;

const TAG_FILE_BY_VERSION_QUERY = gql`
query TagFileByVersion($version: ID!) {
  tagFileByVersion(version: $version) {
    precalcs {
      name
      type
      from {
        list
        type
        path
        conditions
      }
      list
      value
      conditions
    }
    tags {
      key
      text
      color
      description
      triggers
      value
    }
  }
}
`;

const BACK_FILL_MUTATION = gql`
 mutation FormatAllParticipants {
  formatAllParticipants {
    total
    success
    failed
    errors
  }
}
`;


export const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { loading, error, data } = useQuery(GAME_DATA_QUERY);
  const adminTag = useQuery(TAG_VERSIONS_QUERY);
  const [champions, setChampions] = useState(null);
  const [items, setItems] = useState(null);
  const [queues, setQueues] = useState(null);
  const [queueMap, setQueueMap] = useState(null);
  const [queuesSimplified, setQueuesSimplified] = useState(null);
  const [summoners, setSummoners] = useState(null);
  const [tags, setTags] = useState(null);
  const [tagsFileVersions, setTagsFileVersions] = useState(null);
  const [tagsCurrentVersion, setTagsCurrentVersion] = useState(null);
  const [tagsLastBackFill, setTagsLastBackFill] = useState(null);
  const [matchListQuery, setMatchListQuery] = useState(MATCHES_PAGE_QUERY);

  useEffect(() => {
    if (data) {
      setChampions(data.gameData.champions.data);
      setItems(data.gameData.items);
      setQueues(data.gameData.queueTypes);
      setSummoners(data.summoners);
      setTags(data.gameData.tagData);
      setQueuesSimplified(["ARAM", "Draft", "Ranked Solo", "Ranked Flex", "URF", "ARURF", "Summoner's Spellbook", "Other"]);
    }
    if (data && data.gameData.tagData) {
      //replace contents of tag section of the match page query with the tags from the server
      let matchListTemp = matchListQuery;
      matchListTemp.definitions[0].selectionSet.selections.at(-1).selectionSet.selections.at(-1).selectionSet.selections.at(-1).selectionSet.selections.at(-1).selectionSet.selections = data.gameData.tagData.tags.map(tag => ({
        kind: "Field",
        name: { kind: "Name", value: tag.key },
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: { kind: "Name", value: "isTriggered" }
            },
            {
              kind: "Field",
              name: { kind: "Name", value: "value" }
            }
          ]
        }
      }));
      setMatchListQuery(matchListQuery);
    }
  }, [data]);

  useEffect(() => {
    if (adminTag.data) {
      setTagsFileVersions(adminTag.data.tagFileVersions);
      setTagsCurrentVersion(adminTag.data.tagCurrentVersion);
      setTagsLastBackFill(adminTag.data.tagLastBackFill);
    }
  }, [adminTag.data]);

  useEffect(() => {
    //sort queues into ARAM, Draft, Ranked, URF, ARURF, Summoner's Spellbook, and Other
    if (queues) {
      const aram = queues.filter(q => q.description?.includes("ARAM"));
      const draft = queues.filter(q => q.description?.includes("Draft"));
      const rankedSolo = queues.filter(q => q.description?.includes("Ranked") && q.description?.includes("Solo"));
      const rankedFlex = queues.filter(q => q.description?.includes("Ranked") && q.description?.includes("Flex"));
      const urf = queues.filter(q => q.description?.includes("URF"));
      const arurf = queues.filter(q => q.description?.includes("ARURF"));
      const spellbook = queues.filter(q => q.description?.includes("Spellbook"));
      const other = queues.filter(q => !q.description?.includes("ARAM") && !q.description?.includes("Draft") && !q.description?.includes("Ranked") && !q.description?.includes("URF") && !q.description?.includes("ARURF") && !q.description?.includes("Spellbook"));
      setQueueMap({ aram, draft, rankedSolo, rankedFlex, urf, arurf, spellbook, other });
    }
  }, [queues]);

  if (loading || adminTag.loading) {
    return (
      <Stack w={"100vw"} h={"100vh"} justify={"center"} align={"center"}>
        <Loader type='bars' size='xl' />
      </Stack>
    )
  } else if (!champions || !items || !queues || !summoners || !tags || !tagsFileVersions || !tagsCurrentVersion) {
    return <div>no data</div>;
    }

  if (error || adminTag.error) {
    return <div>Error loading game data</div>;
  }

  const utils = {
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

    getChampName: (id) => {
      const championArray = Object.values(champions);
      const champion = championArray.find(c => parseInt(c.key) === parseInt(id));
      return champion ? champion.name : "unnamed";
    },

    getChampList: () => champions,

    getChampArray: () => Object.values(champions),

    getChampionDetails: (id) => {
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
      if (id === undefined || id === "") return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-middle.svg`;
      return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/svg/position-${id.toLowerCase()}.svg`;
    },

    getQueueName: (id) => {
      const queue = queues.find(q => q.queueId === id);
      return queue ? queue.description : "any";
    },

    getItemIcon: (id) => {
      const item = items.find(i => parseInt(i.id) === id);
      if (item && item.iconPath) {
        const pathArray = item.iconPath.split("/lol-game-data/assets/");
        return "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/" + pathArray[1].toLowerCase();
      }
      return "unnamed";
    },

    getItemName: (id) => {
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
      const perkName = utils.getPerkStyleName(id);
      const perkFileName = utils.getPerkStyleFileName(perkName);
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
      const spellFileName = utils.getSummonerSpellFileName(id);
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

    getTags: () => tags.tags,

    getTag: (id) => {
      return tags.tags[id];
    },

    getPrecalcs: () => tags.precalcs,

    getMatchListQuery: () => matchListQuery,

    getDisplayNameFromQueueId: (id) => { 
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

    getDisplayNamesFromQueueIds: (ids) => {

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
    
    getQueueIdsFromDisplayNames: (names) => {
      let queueIds = [];
      if (queueMap === null) return ["0"];
      names.forEach(name => {
        if (name === "ARAM") queueIds.push(...queueMap.aram.map(queue => queue.queueId));
        else if (name === "Draft") queueIds.push(...queueMap.draft.map(queue => queue.queueId));
        else if (name === "Ranked Solo") queueIds.push(...queueMap.rankedSolo.map(queue => queue.queueId));
        else if (name === "Ranked Flex") queueIds.push(...queueMap.rankedFlex.map(queue => queue.queueId));
        else if (name === "URF") queueIds.push(...queueMap.urf.map(queue => queue.queueId));
        else if (name === "ARURF") queueIds.push(...queueMap.arurf.map(queue => queue.queueId));
        else if (name === "Summoner's Spellbook") queueIds.push(...queueMap.spellbook.map(queue => queue.queueId));
        else queueIds.push("0");
      });
      return queueIds;
    },

    getUpdateTagsMutation: () => UPDATE_TAGS_MUTATION,

    getTagFileByVersionQuery: () => TAG_FILE_BY_VERSION_QUERY,

    getBackFillMutation: () => BACK_FILL_MUTATION,

    reloadAdminTagData: async () => {
      const { data } = await adminTag.refetch();
      setTagsFileVersions(data.tagFileVersions);
      setTagsCurrentVersion(data.tagCurrentVersion);
      setTagsLastBackFill(data.tagLastBackFill);
    }
  };

  return (
    <DataContext.Provider value={{...utils, summoners, champions, items, queues, tags, tagsFileVersions, tagsCurrentVersion, tagsLastBackFill, queueMap, queuesSimplified, matchListQuery}}>
      {children}
    </DataContext.Provider>
  );
}

export function useGameData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useGameData must be used within a DataProvider');
  }
  return context;
}