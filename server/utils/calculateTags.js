const yaml = require('yaml');
const fs = require('fs'); 
const yamlContent = fs.readFileSync('./server/data/tags.yaml', 'utf8');

function evaluateCondition(metric, operator, value, context) {
  try{ 
    const actualMetric = metric.split('.').reduce((obj, key) => obj?.[key], context);
    if(value)
    const actualValue = value.split('.').reduce((obj, key) => obj?.[key], context);
  
    switch(operator) {
      case '===': return actualMetric === actualValue;
      case '!==': return actualMetric !== actualValue;
      case '>': return actualMetric > actualValue;
      case '<': return actualMetric < actualValue;
      case '>=': return actualMetric >= actualValue;
      case '<=': return actualMetric <= actualValue;
      case '==': return actualMetric == actualValue;
      default: return false;
  }
  }catch(e){
    console.log(e);
    return false;
  }
  
}

function calculatePrecalc(precalc, context) {
  switch(precalc.type) {
    case 'list':
      const sourceList = precalc.from.list.split('.').reduce((obj, key) => obj?.[key], context);
      if (!sourceList) return [];
      return sourceList.filter(item => 
        evaluateCondition(precalc.from.condition.metric, 
                         precalc.from.condition.operator, 
                         precalc.from.condition.value, 
                         { ...context, item: item })
      );

    case 'avg':
      const list = context[precalc.list];
      if (!list) return 0;
      const values = list.map(item => precalc.from.split('.').reduce((obj, key) => obj?.[key], item));
      return values.reduce((a, b) => a + b, 0) / values.length;

    case 'copy':
      if (precalc.from.list) {
        const list = context[precalc.from.list];
        if (!list) return 0;
        return list.find(item => 
          evaluateCondition(precalc.from.condition.metric,
                          precalc.from.condition.operator,
                          precalc.from.condition.value,
                          { ...context, item: item }));
      }
      return precalc.from.split('.').reduce((obj, key) => obj?.[key], context);

    case 'boolean':
      return precalc.conditions.every(condition =>
        evaluateCondition(condition.metric, condition.operator, condition.value, context));
  }
}

function processTags(participant, match) {
  const config = yaml.parse(yamlContent);
  // Process precalculations
  const precalcs = {};
  const context = { match, participant, precalcs };

  
  for (const precalc of config.precalcs || []) {
    precalcs[precalc.name] = calculatePrecalc(precalc, { ...context });
  }
  console.log(`Precalcs complete for ${participant.puuid}`);

  // Evaluate tags
  const results = {};
  for (const [tagId, tag] of Object.entries(config.tags)) {
    if (!tag.triggers) continue;

    const tagResult = {
      isTriggered: tag.triggers.every(trigger => 
        evaluateCondition(trigger.metric, trigger.operator, trigger.value, 
                         { ...context, item: participant })),
      value: null // Add value calculation if needed
    };

    results[tagId] = tagResult;
  }

  return results;
}

module.exports = { processTags };