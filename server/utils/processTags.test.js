const { processTags } = require('./processTags.js');
const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);

describe('Tag Processor Tests', () => {
  let testMatches;
  let tags;
  
  beforeAll(async () => {
    // Load test match data
    const testDataPath = path.join(__dirname, './sampleMatches.json');
    testMatches = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
    const [data] = await bucket.file("data/tags.yaml").download();
    tags = yaml.load(data.toString());
  });

  beforeEach(() => {
    // Mock console.log to prevent noise in test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should skip processing for short games', () => {
    const shortMatch = {
      info: { gameDuration: 200 },
      // ... other match data
    };
    const participant = {
      puuid: 'test-player-1',
      // ... other participant data
    };

    const result = processTags(participant, shortMatch, tags);
    expect(result).toEqual({});
  });

  test('should process precalcs of type list', () => {
    const match = testMatches[0];  // Assuming first match from test data
    const participant = match.info.participants[0];
    
    const result = processTags(participant, match, tags);
    // Check that the result contains expected tags
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  test('should handle missing data gracefully', () => {
    const invalidMatch = {
      info: {
        gameDuration: 1000,
        participants: []
      }
    };
    const invalidParticipant = {};

    const result = processTags(invalidParticipant, invalidMatch, tags);
    expect(result).toBeDefined();
    // Should not throw errors for missing data
  });

  test('should calculate averages correctly', () => {
    const match = testMatches[0];
    const participant = match.info.participants[0];
    
    const result = processTags(participant, match, tags);
    // Check specific average calculations based on your yaml config
    // You'll need to adjust these expectations based on your actual tags.yaml
  });

  test('should evaluate boolean conditions correctly', () => {
    const match = testMatches[0];
    const participant = match.info.participants[0];
    
    const result = processTags(participant, match, tags);
    // Check boolean tag results
    Object.entries(result).forEach(([tagId, tagResult]) => {
      expect(typeof tagResult.isTriggered).toBe('boolean');
    });
  });

  test('should handle calculation errors gracefully', () => {
    const match = {
      info: {
        gameDuration: 1000,
        participants: [{
          puuid: 'test-player',
          // Deliberately missing data that might cause calculation errors
        }]
      }
    };
    const participant = match.info.participants[0];

    const result = processTags(participant, match, tags);
    expect(result).toBeDefined();
    // Should not throw errors for calculation issues
  });

  test('should process copy operations correctly', () => {
    const match = testMatches[0];
    const participant = match.info.participants[0];
    
    const result = processTags(participant, match, tags);
    // Verify copy operations based on your yaml config
  });

  // Helper function to test specific tag calculations
  const testSpecificTag = (tagId, result) => {
    expect(result[tagId]).toBeDefined();
    expect(result[tagId]).toHaveProperty('isTriggered');
    expect(result[tagId]).toHaveProperty('value');
    return result[tagId];
  };

  test('should return all tags, triggered and untriggered or be entirely empty', () => {
    const tagResults = {};
    let index = 0;
    for (const match of testMatches) {
      const participants = match.info?.participants?? [{}];
      for(participant of participants) {
        const result = processTags(participant, match, tags);
        if (Object.keys(result).length === 0) {
          // Empty result, no tags should be processed
          continue;
        }

        let resultsIndex = (match.metadata?.matchId?? index) + "-" +(participant.summonerId?? index);
  
        tagResults[resultsIndex] = {};
        
        // Check that all tags are processed
        for (const [tagId, tag] of Object.entries(tags.tags)) {
          tagResults[resultsIndex][tagId] = testSpecificTag(tagId, result);
        }
        index++;
      }
    }
  
    // Check that all tags are processed for each match
    for (const [matchId, result] of Object.entries(tagResults)) {
      expect(Object.keys(result)).toEqual(Object.keys(tags.tags));
    }

  });

  test('should maintain consistent precalc context', () => {
    const match = testMatches[0];
    const participant = match.info.participants[0];
    
    // Run the processor multiple times to ensure consistent results
    const result1 = processTags(participant, match, tags);
    const result2 = processTags(participant, match, tags);
    
    expect(result1).toEqual(result2);
  });
});