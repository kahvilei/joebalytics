import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css'; 

import yaml from 'js-yaml';

import { Container, Group, Text, Title, Button, Stack, Loader} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useGameData } from '../../context/DataContext';

import { useMutation } from '@apollo/client';

function TagUpdate() {
    const { tags, getUpdateTagsMutation } = useGameData();
    const [value, setValue] = useState(yaml.dump({precalcs:tags.precalcs, tags:tags.tags}));
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
  
    const [updateTags] = useMutation(getUpdateTagsMutation(), {
      onCompleted: () => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => setSuccess(false), 3000); // Clear success after 3s
      },
      onError: (error) => {
        setError(error.message);
        setLoading(false);
      }
    });
  
    const submit = async () => {
      try {
        setLoading(true);
        setError(null);
        const parsedYaml = value;
        await updateTags({
          variables: { file: parsedYaml }
        });
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

   return (
        <Container size={'xl'}>
        <Stack spacing="xl">
            <Group position="center">
                <Text>
                    Update the tags file with the yaml editor below. 
                </Text>
                <Button onClick={() => submit()}>{loading ? <Loader/> : 'submit'}</Button>
                <Text c="red">{error}</Text>
            </Group>
            <Editor
            value={value}
            onValueChange={setValue}
            highlight={code => highlight(code, languages.yaml, 'yaml')}
            padding={10}
            
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                borderRadius: 5,
                backgroundColor: "var(--mantine-color-dark-9)"
            }}
            />
        </Stack>
        </Container>
   )
}

export default TagUpdate;
