const yaml = require('yaml');
const fs = require('fs');
const yamlContent = fs.readFileSync('./server/data/tags.yaml', 'utf8');

function calculatePrecalc(precalc, context) {
  switch (precalc.type) {
    case 'list':
      const sourceList = precalc.from.list.split('.').reduce((obj, key) => obj?.[key], context);
      if (!sourceList) return [];
      return sourceList.filter(item => {
        return precalc.from.conditions.every(condition => {
          const evaluateConditions = new Function('match', 'participant', 'precalcs', 'item', `return ${condition}`);
          return evaluateConditions(context.match, context.participant, context.precalcs, item);
        }
        );
      }
      );

    case 'avg':
      const list = precalc.list.split('.').reduce((obj, key) => obj?.[key], context);
      if (!list) return 0;
      const values = list.map(item => precalc.from.split('.').reduce((obj, key) => obj?.[key], item));
      return values.reduce((a, b) => a + b, 0) / values.length;

    case 'copy':
      if (precalc.from.list) {
        const list = precalc.from.list.split('.').reduce((obj, key) => obj?.[key], context);
        if (!list) return 0;
        return list.find(item => {
          return precalc.from.conditions.every(condition => {
            const evaluateConditions = new Function('match', 'participant', 'precalcs', 'item', `return ${condition}`);
            return evaluateConditions(context.match, context.participant, context.precalcs, item);
          }
          );
        }
        );
      }
      return precalc.from.split('.').reduce((obj, key) => obj?.[key], context);

    case 'calculate':
      const evaluateValue = new Function('match', 'participant', 'precalcs', `return ${precalc.value}`);
      return evaluateValue(context.match, context.participant, context.precalcs) || 0;

    case 'boolean':
      return precalc.conditions.every(condition => {
        const evaluateConditions = new Function('match', 'participant', 'precalcs', `return ${condition}`);
        return evaluateConditions(context.match, context.participant, context.precalcs) || false;
      }
      );
  }
}

function processTags(participant, match) {
  const config = yaml.parse(yamlContent);
  // Process precalculations
  const precalcs = {};
  const context = { match, participant, precalcs };

  for (const precalc of config.precalcs || []) {
    // split the precalc name by '.' and reduce it to the object
    const value = calculatePrecalc(precalc, context);
    const parts = precalc.name.split('.');
    const key = parts.pop();
    const target = parts.reduce((obj, key) => obj[key] = obj[key] || {}, precalcs);
    target[key] = value;
  }
  console.log(`Precalcs complete for ${participant.puuid}`);
  // Evaluate tags
  const results = {};
  if (match.info.gameDuration < 300) {
    return results;
  }
  for (const [tagId, tag] of Object.entries(config.tags)) {
    if (!tag.triggers) continue;
    const evaluateValue = new Function('match', 'participant', 'precalcs', `return ${tag.value}`);
    const value = evaluateValue(context.match, context.participant, context.precalcs) || null;

    const tagResult = {
      isTriggered: tag.triggers.every(trigger => {
        const evaluateCondition = new Function('match', 'participant', 'precalcs', `return ${trigger}`);
        return evaluateCondition(context.match, context.participant, context.precalcs);
      }
      ),

      value: value
    };

    results[tagId] = tagResult;
  }

  return results;
}

module.exports = { processTags };