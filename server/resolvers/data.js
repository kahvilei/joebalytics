// resolvers/data.js
const { Storage } = require('@google-cloud/storage');
const yaml = require('yaml');

const storage = new Storage();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

const { updateTagFile, getAllVersions, getTagFile, getTagFileByVersion } = require('../controllers/tags');
const { get } = require('http');

const dataResolvers = {
  Query: {
    gameData: async () => {
      try {
        const [championsData] = await bucket.file("data/champions.json").download();
        const [itemsData] = await bucket.file("data/items.json").download();
        const [summonerSpellsData] = await bucket.file("data/summonerSpells.json").download();
        const [queueTypesData] = await bucket.file("data/queueTypes.json").download();
        const [tagsData] = await bucket.file("data/tags/tags.yaml").download();

        const championsDataJSON = JSON.parse(championsData.toString());
        const itemsDataJSON = JSON.parse(itemsData.toString());
        const summonerSpellsDataJSON = JSON.parse(summonerSpellsData.toString());
        const queueTypesDataJSON = JSON.parse(queueTypesData.toString());
        const tagsDataJSON = yaml.parse(tagsData.toString());

        const tagFileVersions = await getAllVersions();
    
        return {
          champions: championsDataJSON,
          items: [...itemsDataJSON],
          summonerSpells: summonerSpellsDataJSON,
          queueTypes: queueTypesDataJSON,
          tagData: tagsDataJSON,
          tagFileVersions: tagFileVersions.versions,
          tagCurrentVersion: tagFileVersions.currentVersion,
          tagFileBackFill: tagFileVersions.lastBackFill
        };
      } catch (error) {
        throw new Error('Failed to fetch game data');
      }
    },

    championData: async () => {
      try {
        const [data] = await bucket.file("data/champions.json").download();
        return JSON.parse(data.toString());
      } catch (error) {
        throw new Error('Failed to fetch champion data');
      }
    },

    itemData: async () => {
      try {
        const [data] = await bucket.file("data/items.json").download();
        return JSON.parse(data.toString());
      } catch (error) {
        throw new Error('Failed to fetch item data');
      }
    },

    summonerSpellData: async () => {
      try {
        const [data] = await bucket.file("data/summonerSpells.json").download();
        return JSON.parse(data.toString());
      } catch (error) {
        throw new Error('Failed to fetch summoner spell data');
      }
    },

    queueTypeData: async () => {
      try {
        const [data] = await bucket.file("data/queueTypes.json").download();
        return JSON.parse(data.toString());
      } catch (error) {
        throw new Error('Failed to fetch queue type data');
      }
    },

    tagData: async () => {
      try {
        const [data] = getTagFile();
        return parsedData;
      } catch (error) {
        throw new Error('Failed to fetch tag data');
      }
    },

    tagFileVersions: async () => {
      try {
        const versions = await getAllVersions();
        return versions.versions;
      } catch (error) {
        throw new Error('Failed to fetch tag file versions');
      }
    },

    tagCurrentVersion: async () => {
      try {
        const versions = await getAllVersions();
        return versions.currentVersion;
      } catch (error) {
        throw new Error('Failed to fetch current tag file version');
      }
    },

    tagFileByVersion: async (_, { version }) => {
      try {
        const data = await getTagFileByVersion(version);
        return data;
      } catch (error) {
        throw new Error('Failed to fetch tag data');
      }
    },

    tagLastBackFill: async () => {
      try {
        const versions = await getAllVersions();
        return versions.lastBackFill;
      } catch (error) {
        throw new Error('Failed to fetch last tag backfill');
      }
    }

  },

  Mutation: {
    updateGameData: async (_, __, { user }) => {
      if (!user?.admin) {
        throw new AuthenticationError('Admin access required');
      }

      try {
        const versions = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
        const version = versions.data[0];

        // Fetch new data
        const champions = await axios.get(
          `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
        );
        const items = await axios.get(
          `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json`
        );
        const summonerSpells = await axios.get(
          `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
        );
        const queueTypes = await axios.get(
          `https://static.developer.riotgames.com/docs/lol/queues.json`
        );

        // Add mastery data to champions
        for (let champion in champions.data.data) {
          const champId = champions.data.data[champion].key;
          const mastery = await models.Mastery.find({ championId: champId })
            .sort({ championPoints: 'desc', championLevel: 'desc' });
          champions.data.data[champion].mastery = mastery;
        }

        // Save to bucket
        await Promise.all([
          bucket.file("data/champions.json").save(JSON.stringify(champions.data)),
          bucket.file("data/items.json").save(JSON.stringify(items.data)),
          bucket.file("data/summonerSpells.json").save(JSON.stringify(summonerSpells.data)),
          bucket.file("data/queueTypes.json").save(JSON.stringify(queueTypes.data))
        ]);

        return {
          message: "Game data updated successfully",
          success: true
        };
      } catch (error) {
        throw new Error(`Failed to update game data: ${error.message}`);
      }
    },

    // Update tag data from user uploaded file
    updateTagData: async (_, { file }, { user, updateSchema }) => {
      if (!user?.admin) {
        throw new AuthenticationError('Admin access required');
      }

      try {
        const tags = yaml.parse(file);
        await updateTagFile(tags, user.username);
        await updateSchema();
        return {
          message: "Tag data updated successfully",
          success: true
        };
      } catch (error) {
        throw new Error(`Failed to update tag data: ${error.message}`);
      }
    }
  }
};

module.exports = dataResolvers;