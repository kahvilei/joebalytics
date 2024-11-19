const statsResolver = {
    Query: {
      stats: async (_, { input }, { models }) => {
        const { 
          region, 
          summonerName, 
          role, 
          championId, 
          queueId, 
          limit = 20,
          stats 
        } = input;
  
        // Build query
        const query = {};
        if (region && summonerName) {
          const summoner = await models.Summoner.findOne({
            nameURL: summonerName.toLowerCase(),
            regionURL: region.toLowerCase()
          });
          if (summoner) {
            query.puuid = summoner.puuid;
          }
        }
        if (role) query.teamPosition = role;
        if (championId) query.championId = championId;
        if (queueId) query.queueId = queueId;
  
        // Get matches
        const matches = await models.Participant.find(query)
          .sort({ gameStartTimestamp: 'desc' })
          .limit(limit);
  
        // Calculate stats
        const results = {};
        for (const statRequest of stats) {
          const values = matches
            .filter(match => !match.teamEarlySurrendered)
            .map(match => {
              let value = match;
              for (const key of statRequest.path.split('/')) {
                value = value[key];
              }
              return value;
            });
  
          switch (statRequest.aggregation) {
            case 'AVG':
              results[statRequest.path] = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case 'MAX':
              results[statRequest.path] = Math.max(...values);
              break;
            case 'MIN':
              results[statRequest.path] = Math.min(...values);
              break;
            case 'MODE':
              results[statRequest.path] = mode(values);
              break;
            case 'SUM':
              results[statRequest.path] = values.reduce((a, b) => a + b, 0);
              break;
            case 'UNIQUE':
              results[statRequest.path] = [...new Set(values)];
              break;
            case 'LIST':
            default:
              results[statRequest.path] = values;
          }
        }
  
        return {
          results,
          matchCount: matches.length
        };
      }
    }
  };
  
  // Helper function for mode calculation
  function mode(array) {
    if (array.length === 0) return null;
    
    const modeMap = {};
    let maxCount = 1;
    let modes = [array[0]];
  
    for (const item of array) {
      if (modeMap[item] == null) modeMap[item] = 1;
      else modeMap[item]++;
  
      if (modeMap[item] > maxCount) {
        modes = [item];
        maxCount = modeMap[item];
      } else if (modeMap[item] === maxCount) {
        modes.push(item);
      }
    }
  
    return modes[0];
  }

module.exports = statsResolver;
  