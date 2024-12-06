import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css'; 

import yaml, { load } from 'js-yaml';

import { Container, Group, Text, Title, Button, Stack, Loader, ActionIcon, Select, Card, rem, Tooltip} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { useGameData } from '../../context/DataContext';

import { useMutation, useQuery } from '@apollo/client';
import { IconUpload } from '@tabler/icons-react';
import { get } from 'mongoose';
import { use } from 'react';

function TagUpdate() {
    const { tags, tagsFileVersions, tagsCurrentVersion, getUpdateTagsMutation, getTagFileByVersionQuery, reloadAdminTagData } = useGameData();

    
    const [loading, setLoading] = useState(false);
    const [loadingYAML, setLoadingYAML] = useState(false);
    const [errorUpload, setErrorUpload] = useState(null);
    const [errorLoadYAML, setErrorYAML] = useState(null);
    const [success, setSuccess] = useState(false);
    const [selectedId, setSelectedId] = useState(tagsCurrentVersion.id);

     //function that gets rid of all keys of name __typename created by Apollo
     const removeTypename = (value) => {
      if (value !== null && typeof value === 'object') {
        if (value instanceof Array) {
          return value.map(removeTypename);
        } else {
          const newObj = {};
          Object.entries(value).forEach(([key, value]) => {
            if (key !== '__typename') {
              newObj[key] = removeTypename(value);
            }
          });
          return newObj;
        }
      }
      return value;
    }
  
    const [updateTags] = useMutation(getUpdateTagsMutation(), {
      onCompleted: () => {
        setSuccess(true);
        setLoading(false);
        reloadAdminTagData();
        setTimeout(() => setSuccess(false), 3000); // Clear success after 3s
      },
      onError: (error) => {
        setErrorUpload(error.message);
        setLoading(false);
      }
    });
  
    const submit = async () => {
      try {
        setLoading(true);
        setErrorUpload(null);
        const parsedYaml = value;
        await updateTags({
          variables: { file: parsedYaml }
        });
      } catch (e) {
        setErrorUpload(e.message);
        setLoading(false);
      }
    };

    const getTagFile = getTagFileByVersionQuery();

    const { data, fetchMore } = useQuery(getTagFile, {
      variables: {
        version: selectedId
      }
    });

    const [value, setValue] = useState(yaml.dump(removeTypename(tags)));
    const [changes, setChanges] = useState(value !== yaml.dump(removeTypename(tags)));

    const loadVersion = async () => {
      try {
        setLoadingYAML(true);
        await fetchMore({
          variables: {
            version: selectedId
          }
        }).then(() => {
          setLoadingYAML(false);
        }
        );
      } catch (e) {
        setErrorYAML(e.message);
        setLoadingYAML(false);
      }
    }   

    useEffect(() => {
      loadVersion();
    }, [selectedId]);

    useEffect(() => {
      if (data) {
        setValue(yaml.dump(removeTypename(data.tagFileByVersion)));
      }
    }, [data]);

    useEffect(() => {
      if (tagsCurrentVersion.id !== selectedId) {
        setSelectedId(tagsCurrentVersion.id);
      }
    }, [tagsCurrentVersion]);

    useEffect(() => {
      setChanges(value != yaml.dump(removeTypename(tags)));
    }, [tags, value]);

    const LoadBlock = () => {
      return (
        <Card w={"100%"} bg="var(--mantine-color-dark-9)">
          <Stack align='center' justify='center' height={300}>
          <Text c="dimmed">Loading...</Text>
          <Loader />
          </Stack>
        </Card>
      )
    }

    const ErrorBlock = () => {
      return (
        <Card w={"100%"} bg="var(--mantine-color-dark-9)">
          <Stack align='center' justify='center' height={300}>
          <Text c="red">Error loading YAML</Text>
          <Text c="red">{errorLoadYAML}</Text>
          </Stack>
        </Card>
      )
    }

    
    const renderSelectOption = ({ option, checked }) => {
      const dateString = new Date(parseInt(option.value)).toLocaleString();

      return (
      <Card p={10} m={0} withBorder={checked} bg='none' w={"100%"}>
      <Group align="start" p={0} gap="1" bdr={checked ? '2px solid blue' : ''} wrap='nowrap' justify='space-between'>
        <Stack gap="0">
        {option.value=== tagsCurrentVersion.id && <Text size="xs" c="green" fs={'italic'}>Live Version</Text>} 
        {checked && <Text size="xs" c="blue"fs={'italic'}>Selected</Text>}
        <Text>V. {option.value}</Text>
        <Text size="xs" c='dimmed'>on {dateString}</Text>
        </Stack>
        <Group p={0} align="start" justify='end' w={"120px"}>
        <Text size="sm" c='dimmed'>from {tagsFileVersions.find(v => v.id === option.value).user}</Text>
        </Group>
      </Group>
      </Card>)
    }

   return (
        <Container size={'xl'}>
        <Stack spacing="sm">
            <Group align="end" justify='space-between' p={0}>
              <Group p={0}>
              <Text size="sm" c="dimmed">Tags version: {selectedId}</Text>
              <Group p={0}>
                <Text size="sm" c="dimmed">All versions:</Text>
                <Select 
                  data={tagsFileVersions.map(v => (
                    {
                      label: v.id,
                      value: v.id
                    }
                  ))}
                  value={selectedId}
                  renderOption={renderSelectOption}
                  placeholder="Select version"
                  w={400}
                  onChange={(value) => {
                    setSelectedId(value? value : selectedId);
                  }}
                  styles={
                    {
                      option: {padding: 0, margin: 0, width: '100%'}
                    }
                  }
                />
              </Group>
              </Group>
              <Group p={0}>
              {changes && <Text size="sm" c="dimmed" fs={'italic'}>Unsaved changes present</Text>}
              <Tooltip label="Make live" withArrow>
                <ActionIcon onClick={() => submit()} disabled={!changes}>
                  {loading ? <Loader size={10} color={'dark'}/> : <IconUpload />}
                </ActionIcon>
              </Tooltip>
                <Text c="red">{errorUpload}</Text>
              </Group>
            </Group>
            {loadingYAML && <LoadBlock />}
            {errorLoadYAML && <ErrorBlock />}
            {!loadingYAML && !errorLoadYAML &&
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
              />}
        </Stack>
        </Container>
   )
}

export default TagUpdate;
