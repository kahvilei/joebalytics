function calculatePrecalc(precalc, context) {
  const evalAllConditions = (conditions, item) => {
    return conditions.every(condition => {
      try {
        const evaluateConditions = new Function('match', 'participant', 'precalcs', 'item', `return ${condition}`);
        return evaluateConditions(context.match, context.participant, context.precalcs, item) || 0;
      } catch (e) {
        console.log('Error in condition:', condition);
        console.log(e);
        return 0;
      }
    }
    );
  };
  switch (precalc.type) {
    case 'list':
      const sourceList = precalc.from.list.split('.').reduce((obj, key) => obj?.[key], context);
      if (!sourceList) return [];
      return sourceList.filter(item => {
        return evalAllConditions(precalc.from.conditions, item);
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
          return evalAllConditions(precalc.from.conditions, item);
        }
        );
      }
      return precalc.from.split('.').reduce((obj, key) => obj?.[key], context);

    case 'calculate':
      try {
        const evaluateValue = new Function('match', 'participant', 'precalcs', `return ${precalc.value}`);
        return evaluateValue(context.match, context.participant, context.precalcs) || 0;
      } catch (e) {
        console.log('Error in calculate:', precalc.value);
        console.log(e);
        return 0;
      }

    case 'boolean':
      return evalAllConditions(precalc.conditions);
  }
}

function processTags(participant, match, tagsFile) {
  const tags = tagsFile;
  // Process precalculations
  const precalcs = {};
  const context = { match, participant, precalcs };

  for (const precalc of tags.precalcs || []) {
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
  if (match.info?.gameDuration < 300 || !match.info) {
    return results;
  }
  for (const tag of tags.tags) {
    if (!tag.triggers) continue;
    let value = null;
    try {
      const evaluateValue = new Function('match', 'participant', 'precalcs', `return ${tag.value}`);
      value = evaluateValue(context.match, context.participant, context.precalcs) || null;
    } catch (e) {
      console.log('Error in value:', tag.value);
      console.log(e);
    }

    const tagResult = {
      isTriggered: tag.triggers.every(trigger => {
        try {
          const evaluateCondition = new Function('match', 'participant', 'precalcs', `return ${trigger}`);
          return evaluateCondition(context.match, context.participant, context.precalcs);
        } catch (e) {
          console.log('Error in condition:', trigger);
          console.log(e);
          return false;
        }
      }
      ),

      value: value
    };

    results[tag.key] = tagResult;
  }

  return results;
}

module.exports = { processTags };