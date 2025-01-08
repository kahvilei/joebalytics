// resolvers/data.js

// third party
const yaml = require('yaml');

// internal
const {updateTagFile, getTagFileByVersion} = require('../controllers/tags');
const {updateDataFromRiot} = require('../controllers/data');
const {AuthenticationError} = require("apollo-server-express");
const { cache: data } = require('../controllers/data');

// resolvers
const dataResolvers = {
    Query: {
        // returns all current game data, including champions, items, summoner spells, queue types, summoner info, and user-defined tags
        gameData: () => {
            try {
                return {
                    champions: data.champions,
                    items: data.items,
                    summonerSpells: data.summonerSpells,
                    queueTypes: data.queueTypes,
                    summoners: data.summoners,
                    tagData: data.tags,
                    tagFileVersions: data.tagFileVersions,
                    tagCurrentVersion: data.tagCurrentVersion,
                    tagLastBackFill: data.tagLastBackFill
                };
            } catch (error) {
                throw new Error('Failed to fetch game data');
            }
        },
        // returns a tag yaml file by version
        tagFileByVersion: async (_, {version}) => {
            try {
                return getTagFileByVersion(version);
            } catch (error) {
                throw new Error('Failed to fetch tag data');
            }
        }
    },

    Mutation: {
        // Update game data from Riot API, see controllers/data.js
        updateGameData: async (_, __, {user}) => {
            if (!user?.admin) {
                throw new AuthenticationError('Admin access required');
            }
            try {
                return updateDataFromRiot();
            } catch (error) {
                throw new Error(`Failed to update game data: ${error.message}`);
            }
        },

        // Update tag data from user uploaded file
        updateTagData: async (_, {file}, {user, updateSchema}) => {
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