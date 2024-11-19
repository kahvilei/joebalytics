// resolvers/mastery.js
const masteryResolvers = {
    Query: {
      mastery: async (_, { id }, { models }) => {
        return await models.Mastery.findById(id);
      },
  
      masteries: async (_, { 
        limit, 
        championId, 
        sortBy = { field: 'CHAMPION_POINTS', direction: 'DESC' } 
      }, { models }) => {
        const query = championId ? { championId } : {};
        const sort = {};
        sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;
  
        return await models.Mastery.find(query)
          .sort(sort)
          .limit(limit);
      }
    }
  };

module.exports = masteryResolvers;