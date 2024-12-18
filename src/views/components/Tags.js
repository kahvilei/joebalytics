import React, { useContext } from 'react';
import { Badge, Group, Tooltip, useMantineTheme } from '@mantine/core';
import { ParticipantContext } from './MatchCard';
import { useGameData } from "../../context/DataContext";

function Tags() {
    
  const getTag = (tag, isTriggered, value) => {
    if (!isTriggered) {
      return { 
        text: 'Unknown Tag', 
        color: 'dark', 
        description: 'oopsie' 
      };
    }

    // Get the tag definition from the JSON
    const tagDefinition = tagsArray.find((t) => t.key === tag);
    
    if (!tagDefinition) {
      return { 
        text: 'Unknown Tag', 
        color: 'dark', 
        description: `couldn't find ${tag} definition, oopsie` 
      };
    }

    // If there's a value, replace {value} placeholder in description
    const description = tagDefinition.description.replace('{value}', value?.toString() || '0');

    return {
      text: tagDefinition.text,
      color: tagDefinition.color,
      description: description
    };
  };

  const { getTags } = useGameData();
  const tagsArray = getTags();
  const tags = [];

  const { participant } = useContext(ParticipantContext);
  const theme = useMantineTheme();
  const tagBools = participant.tags;

 if (!tagBools) {
    return null;
  }
  for (const [key, value] of Object.entries(tagBools)) {
    if (!value) {
      continue;
    }
    if (value.isTriggered){
      tags.push(getTag(key, value.isTriggered, value.value));
    }
  }

return (
  <Group gap={4} justify='end'>
    {tags.map((tag) => (
      <Tooltip key={tag.text + participant.id} label={tag.description} position="top">
        {tag.color === 'yellow' ? (
          <Badge
            c={'rgb(156, 88, 16)'}
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 30%, #FFD700 50%, #FDB931 70%, #FFD700 100%)',
              boxShadow: '0 2px 4px rgba(253, 185, 49, 0.3)',
              border: '1px solid #FDB931',
              animation: 'shine 2s infinite linear'
            }}
            variant="filled"
          >
            {tag.text}
          </Badge>
        ) : (
          <Badge c={tag.color} color={theme.colors.dark[8]} variant="filled">
            {tag.text}
          </Badge>
        )}
      </Tooltip>
    ))}
  </Group>
);
}

export default Tags;

