import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Loader, Stack } from '@mantine/core';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { gameDataUtils } from '../utils/gameDataUtils';
import _ from 'lodash';
import { GAME_DATA_QUERY, TAG_VERSIONS_QUERY } from "../graphql/queries";

export const DataContext = createContext(null);

function compareData(oldData, newData) {
  return !_.isEqual(oldData, newData);
}

export function DataProvider({ children }) {
  // Local storage hooks
  const [gameData, setGameData] = useLocalStorage('gameData', null);
  const [adminTagData, setAdminTagData] = useLocalStorage('adminTagData', null);

  // State management
  const [champions, setChampions] = useState(null);
  const [items, setItems] = useState(null);
  const [queues, setQueues] = useState(null);
  const [queueMap, setQueueMap] = useState(null);
  const [queuesSimplified, setQueuesSimplified] = useState(null);
  const [summoners, setSummoners] = useState(null);
  const [tags, setTags] = useState(null);

  // Admin state
  const [tagsFileVersions, setTagsFileVersions] = useState(null);
  const [tagsCurrentVersion, setTagsCurrentVersion] = useState(null);
  const [tagsLastBackFill, setTagsLastBackFill] = useState(null);

  // Initial data loading and background sync queries
  const { data: freshGameData, loading: gameDataLoading, refetch: refetchGameData } = useQuery(GAME_DATA_QUERY, {
    fetchPolicy: "network-only"
  });

  const { data: freshAdminData, loading: adminDataLoading, refetch: refetchAdminTagData } = useQuery(TAG_VERSIONS_QUERY, {
    fetchPolicy: "network-only"
  });

  // Initial setup from cached data
  useEffect(() => {
    if (gameData) {
      setChampions(gameData.champions);
      setItems(gameData.items);
      setQueues(gameData.queueTypes);
      setSummoners(gameData.summoners);
      setTags(gameData.tagData);
      setQueuesSimplified(["ARAM", "Draft", "Ranked Solo", "Ranked Flex", "URF", "ARURF", "Summoner's Spellbook", "Other"]);
    }

    if (adminTagData) {
      setTagsFileVersions(adminTagData.tagFileVersions);
      setTagsCurrentVersion(adminTagData.tagCurrentVersion);
      setTagsLastBackFill(adminTagData.tagLastBackFill);
    }
  }, []);

  // Background sync effect
  useEffect(() => {
    if (freshGameData?.gameData) {
      const newGameData = {
        champions: freshGameData.gameData.champions.data,
        items: freshGameData.gameData.items,
        queueTypes: freshGameData.gameData.queueTypes,
        summoners: freshGameData.gameData.summoners,
        tagData: freshGameData.gameData.tagData,
      };

      // Only update if data has changed
      if (compareData(gameData, newGameData)) {
        setGameData(newGameData);
        setChampions(newGameData.champions);
        setItems(newGameData.items);
        setQueues(newGameData.queueTypes);
        setSummoners(newGameData.summoners);
        setTags(newGameData.tagData);
      }
    }

    if (freshAdminData?.gameData) {
      const newAdminData = {
        tagFileVersions: freshAdminData.gameData.tagFileVersions,
        tagCurrentVersion: freshAdminData.gameData.tagCurrentVersion,
        tagLastBackFill: freshAdminData.gameData.tagLastBackFill
      };

      // Only update if admin data has changed
      if (compareData(adminTagData, newAdminData)) {
        setAdminTagData(newAdminData);
        setTagsFileVersions(newAdminData.tagFileVersions);
        setTagsCurrentVersion(newAdminData.tagCurrentVersion);
        setTagsLastBackFill(newAdminData.tagLastBackFill);
      }
    }
  }, [freshGameData, freshAdminData]);

  // Queue map effect
  useEffect(() => {
    if (queues) {
      const queueTypes = {
        aram: queues.filter(q => q.description?.includes("ARAM")),
        draft: queues.filter(q => q.description?.includes("Draft")),
        rankedSolo: queues.filter(q => q.description?.includes("Ranked") && q.description?.includes("Solo")),
        rankedFlex: queues.filter(q => q.description?.includes("Ranked") && q.description?.includes("Flex")),
        urf: queues.filter(q => q.description?.includes("URF")),
        arurf: queues.filter(q => q.description?.includes("ARURF")),
        spellbook: queues.filter(q => q.description?.includes("Spellbook")),
        other: queues.filter(q => !q.description?.includes("ARAM") &&
            !q.description?.includes("Draft") &&
            !q.description?.includes("Ranked") &&
            !q.description?.includes("URF") &&
            !q.description?.includes("ARURF") &&
            !q.description?.includes("Spellbook"))
      };
      setQueueMap(queueTypes);
    }
  }, [queues]);

  // Loading states
  if ((!gameData && gameDataLoading) || (!adminTagData && adminDataLoading)) {
    return (
        <Stack w="100vw" h="100vh" justify="center" align="center">
          <Loader type='bars' size='xl' />
        </Stack>
    );
  }

  if (!champions || !items || !queues || !summoners || !tags) {
    return <div>No data available</div>;
  }

  const refreshAllData = async () => {
    // manually refreshes our data
    await refetchGameData();
    await refetchAdminTagData();
  }

  // Create the final context value by binding the data to the utility functions
  const contextValue = {
    // Bind data to utility functions
    getSummonerIcon: gameDataUtils.getSummonerIcon,
    getChallengeIcon: gameDataUtils.getChallengeIcon,
    getChampIcon: gameDataUtils.getChampIcon,
    getChampSplash: gameDataUtils.getChampSplash,
    getChampName: (id) => gameDataUtils.getChampName(id, champions),
    getChampList: () => gameDataUtils.getChampList(champions),
    getChampArray: () => gameDataUtils.getChampArray(champions),
    getChampionDetails: (id) => gameDataUtils.getChampionDetails(id, champions),
    getRoleName: gameDataUtils.getRoleName,
    getRoleIcon: gameDataUtils.getRoleIcon,
    getQueueName: (id) => gameDataUtils.getQueueName(id, queues),
    getItemIcon: (id) => gameDataUtils.getItemIcon(id, items),
    getItemName: (id) => gameDataUtils.getItemName(id, items),
    getSpellIcon: gameDataUtils.getSpellIcon,
    getRuneIcon: gameDataUtils.getRuneIcon,
    getPerkStyleIcon: gameDataUtils.getPerkStyleIcon,
    getPerkStyleFileName: gameDataUtils.getPerkStyleFileName,
    getPerkStyleName: gameDataUtils.getPerkStyleName,
    getSummonerSpellIcon: gameDataUtils.getSummonerSpellIcon,
    getSummonerSpellFileName: gameDataUtils.getSummonerSpellFileName,
    getSummonerSpellName: gameDataUtils.getSummonerSpellName,
    getRegionName: gameDataUtils.getRegionName,
    getDisplayNameFromQueueId: (id) => gameDataUtils.getDisplayNameFromQueueId(id, queues),
    getDisplayNamesFromQueueIds: (ids) => gameDataUtils.getDisplayNamesFromQueueIds(ids, queues),
    getQueueIdsFromDisplayNames: (names) => gameDataUtils.getQueueIdsFromDisplayNames(names, queueMap),
    getTags: () => tags.tags,

    // server/data interaction
    reloadAdminTagData: () => refetchAdminTagData(),
    refreshAllData: () => refreshAllData(),

    // Raw data
    summoners,
    champions,
    items,
    queues,
    tags,
    tagsFileVersions,
    tagsCurrentVersion,
    tagsLastBackFill,
    queueMap,
    queuesSimplified,
  };

  return (
      <DataContext.Provider value={contextValue}>
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