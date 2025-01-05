const path = require('path');

const yaml = require('js-yaml');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

let versions = { versions: [], currentVersion : {id:0, user:'user'}, lastBackFill: {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}}};


function calculatePrecalc(precalc, context) {
  const evalAllConditions = (conditions, item) => {
    return conditions.every(condition => {
      try {
        const evaluateConditions = new Function('match', 'participant', 'precalcs', 'item', `return ${condition}`);
        return evaluateConditions(context.match, context.participant, context.precalcs, item) || false;
      } catch (e) {
        if (context.match.info.gameMode === 'ARAM' && condition.includes('team') && condition.includes('challenge')) {
          return false;
        }
        console.log('Error in condition:', condition);
        console.log(e);
        return false;
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
      const values = list.map(item => precalc.value.split('.').reduce((obj, key) => obj?.[key], item));
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
        //if this is an aram match, and the error is on team.[laner].challenge, it's because the laner is not defined, do not print error
        if (context.match.info.gameMode === 'ARAM' && precalc.value.includes('team') && precalc.value.includes('challenge')) {
          return 0;

        }
        console.log('Error in calculate:', precalc.value);
        return 0;
      }

    case 'boolean':
      return evalAllConditions(precalc.conditions);

    default:
      return false;
  }
}

async function processTags(participant, match, data) {
  const tags = data?.tags || await getTagFile();
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


    results[tag.key] = {
      isTriggered: tag.triggers.every(trigger => {
            try {
              const evaluateCondition = new Function('match', 'participant', 'precalcs', `return ${trigger}`);
              if (tag.key === 'jackOfAllTrades' && evaluateCondition(context.match, context.participant, context.precalcs)){
                //we stop here for debugginh.
                return true;
              }
              return evaluateCondition(context.match, context.participant, context.precalcs);
            } catch (e) {
              console.log('Error in condition:', trigger);
              console.log(e);
              return false;
            }
          }
      ) || false,

      value: value
    };
      // if (tag.key === 'jackOfAllTrades' && results[tag.key].isTriggered){
      //   //we stop here for debugginh.
      //  console.log('deb');
      // }
  }

  return results;
}

async function getTagFile() {
  const [tagsfile] = await bucket.file("data/tags/tags.yaml").download();
  return yaml.load(tagsfile.toString());
}

async function updateTagFile(file, user, data) {
  const tags = yaml.dump(file);
  //get current tags file and save it as tag.[timestamp].yaml
  const timestamp = new Date().getTime();
  await bucket.file(`data/tags/tags.${timestamp}.yaml`).save(tags);
  // get versions yaml, if it doesn't exist, create it
  try {
    [versions] = await bucket.file("data/tags/versions.yaml").download();
    versions = yaml.load(versions.toString());
  } catch (error) {
    versions = { versions: [], currentVersion: {id:0, user:'user'}, lastBackFill: {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}}};
  }
  //add the timestamp to the versions file
  versions.versions.unshift({ id: timestamp, user: user });
  versions.currentVersion = { id: timestamp, user: user };
  //save the versions file
  await bucket.file("data/tags/versions.yaml").save(yaml.dump(versions));

  data.tags = file;
  data.tagFileVersions = versions.versions;
  data.tagCurrentVersion = versions.currentVersion;
  data.tagLastBackFill = versions.lastBackFill;

  //save the new tags file
  await bucket.file("data/tags/tags.yaml").save(tags);
}

async function revertTagFile(version, user) {
  //get the tags file with the version number
  const [tagsfile] = await bucket.file(`data/tags/tags.${version}.yaml`).download();
  const tags = yaml.load(tagsfile.toString());
  //save the tags file
  await bucket.file("data/tags/tags.yaml").save(yaml.dump(tags));
  //get versions yaml, if it doesn't exist, create it
  try {
    [versions] = await bucket.file("data/tags/versions.yaml").download();
    versions = yaml.load(versions.toString());
  } catch (error) {
    versions = { versions: [], currentVersion: {id:0, user:'user'}, lastBackFill: {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}}};
  }
  versions.currentVersion = { id: version, user: user };
  //save the versions file
  await bucket.file("data/tags/versions.yaml").save(yaml.dump(versions));
}

async function getAllVersions() {
  try {
    [versions] = await bucket.file("data/tags/versions.yaml").download();
    versions = yaml.load(versions.toString());
  } catch (error) {
    versions = { versions: [], currentVersion: {id:0, user:'user'}, lastBackFill: {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}}};
  }
  //fill any missing data
  if (!versions.currentVersion) {
    versions.currentVersion = {id:0, user:'user'};
  }
  if (!versions.lastBackFill) {
    versions.lastBackFill = {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}};
  }
  return versions;
}

const getTagFileByVersion = async (version) => {
  const [tagsfile] = await bucket.file(`data/tags/tags.${version}.yaml`).download();
  return yaml.load(tagsfile.toString());
}

const addBackFillData = async (results, user, data) => {
  try {
    [versions] = await bucket.file("data/tags/versions.yaml").download();
    versions = yaml.load(versions.toString());
  } catch (error) {
    versions = { versions: [], currentVersion: {id:0, user:'user'}, lastBackFill: {id:0, user:'user', results: {failed:0, success:0, total:0, errors:[]}}};
  }
  versions.lastBackFill = { id: versions.currentVersion.id, user: user.username, results: results };
  await bucket.file("data/tags/versions.yaml").save(yaml.dump(versions));
  data.tagLastBackFill = versions.lastBackFill;
}




module.exports = { processTags, getTagFile, updateTagFile, revertTagFile, getAllVersions, getTagFileByVersion, addBackFillData };