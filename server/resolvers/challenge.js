const challengeResolvers = {
    Query: {
      challenge: async (_, { id }, { models }) => {
        return await models.Challenge.findById(id);
      },
  
      challenges: async (_, { 
        limit, 
        sortBy = { field: 'PERCENTILE', direction: 'DESC' } 
      }, { models }) => {
        const sort = {};
        sort[sortBy.field.toLowerCase()] = sortBy.direction === 'DESC' ? -1 : 1;
  
        return await models.Challenge.find()
          .sort(sort)
          .limit(limit);
      }
    }
  };