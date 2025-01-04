import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css';

import yaml from 'js-yaml';

import { Container, Group, Text, Button, Stack, Loader, ActionIcon, Select, Card, Tooltip, Grid, Paper, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useGameData } from '../../context/DataContext';

import { useMutation, useQuery } from '@apollo/client';
import { IconDatabaseEdit, IconPlus, IconUpload } from '@tabler/icons-react';
import {BACK_FILL_TAGS_MUTATION, TAG_FILE_BY_VERSION_QUERY, UPDATE_TAGS_MUTATION} from "../../graphql/queries";


function TagUpdate() {
  const { tags, tagsFileVersions, tagsCurrentVersion, reloadAdminTagData, tagsLastBackFill } = useGameData();


  const [loading, setLoading] = useState(false);
  const [loadingYAML, setLoadingYAML] = useState(false);
  const [errorUpload, setErrorUpload] = useState(null);
  const [errorLoadYAML, setErrorYAML] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState(tagsCurrentVersion.id);

  const [backFillLoading, setBackFillLoading] = useState(false);
  const [errorBackFill, setErrorBackFill] = useState(null);
  const [backFillErrors, handleErrors] = useDisclosure(false);

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

  const removeNulls = (value) => {
    if (value !== null && typeof value === 'object') {
      if (value instanceof Array) {
        return value.map(removeNulls);
      } else {
        const newObj = {};
        Object.entries(value).forEach(([key, value]) => {
          if (value !== null) {
            newObj[key] = removeNulls(value);
          }
        });
        return newObj;
      }
    }
    return value;
  }

  const cleanData = (value) => {
    return removeNulls(removeTypename(value));
  }

  const [updateTags] = useMutation( UPDATE_TAGS_MUTATION, {
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

  const [backFill] = useMutation( BACK_FILL_TAGS_MUTATION, {
    onCompleted: () => {
      setBackFillLoading(false);
      reloadAdminTagData();
    },
    onError: (error) => {
      setErrorBackFill(error.message);
      setBackFillLoading(false);
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

  const backFillTags = async () => {
    try {
      setBackFillLoading(true);
      setErrorBackFill(null);
      await backFill();
    } catch (e) {
      setErrorBackFill(e.message);
      setBackFillLoading(false);
    }
  }

  const { data, fetchMore } = useQuery( TAG_FILE_BY_VERSION_QUERY, {
    variables: {
      version: selectedId
    }
  });

  const [value, setValue] = useState(yaml.dump(cleanData(tags)));
  const [changes, setChanges] = useState(value !== yaml.dump(cleanData(tags)));

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
      setValue(yaml.dump(cleanData(data.tagFileByVersion)));
    }
  }, [data]);

  useEffect(() => {
    if (tagsCurrentVersion.id !== selectedId) {
      setSelectedId(tagsCurrentVersion.id);
    }
  }, [tagsCurrentVersion]);

  useEffect(() => {
    setChanges(value != yaml.dump(cleanData(tags)));
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
            {option.value === tagsCurrentVersion.id && <Text size="xs" c="green" fs={'italic'}>Live Version</Text>}
            {checked && <Text size="xs" c="blue" fs={'italic'}>Selected</Text>}
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
      <Grid>
        {/* Editor Column - 75% width */}
        <Grid.Col span={9}>
          {loadingYAML && <LoadBlock />}
          {errorLoadYAML && <ErrorBlock />}
          {!loadingYAML && !errorLoadYAML && (
            <Editor
              value={value}
              onValueChange={setValue}
              highlight={code => highlight(code, languages.yaml, 'yaml')}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                borderRadius: 5,
                backgroundColor: "var(--mantine-color-dark-9)",
              }}
            />
          )}
        </Grid.Col>

        {/* Controls Column - 25% width */}
        <Grid.Col span={3}>
          <Stack spacing="md" pos={'sticky'} top={80}>
            <Paper p="md" withBorder>
              <Stack spacing="sm">
                <Group position="apart">
                  <Text size="sm" c="dimmed">Tags version: {selectedId}</Text>
                  <Tooltip label="Make live" withArrow>
                    <ActionIcon onClick={() => submit()} disabled={!changes}>
                      {loading ? <Loader size={10} color={'dark'} /> : <IconUpload />}
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Backfill all match data with current live tag rules - note this may take a while and you may return later to see the results" withArrow>
                    <ActionIcon onClick={() => backFillTags()} disabled={backFillLoading}>
                      {backFillLoading ? <Loader size={10}/> : <IconDatabaseEdit />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
                {changes && (
                    <Text size="sm" c="dimmed" fs={'italic'}>
                      Unsaved changes present
                    </Text>
                  )}
                {errorUpload && (
                  <Text size="sm" c="red">
                    {errorUpload}
                  </Text>
                )}
                {errorBackFill && (
                  <Text size="sm" c="red">
                    {errorBackFill}
                  </Text>
                )}
                <Select
                  data={tagsFileVersions.map(v => ({
                    label: v.id,
                    value: v.id
                  }))}
                  value={selectedId}
                  renderOption={renderSelectOption}
                  comboboxProps={{ width: 400, withArrow: true }}
                  placeholder="Select version"
                  onChange={(value) => setSelectedId(value || selectedId)}
                  styles={{
                    option: { padding: 0, margin: 0, width: '100%' }
                  }}
                />
              </Stack>
            </Paper>

            <Paper p="md" withBorder>
              <Stack gap="md">
                <Stack gap={0}>
                  <Text >Last backfill</Text>
                  <Text size="sm" c="dimmed">Version: {tagsLastBackFill.id}</Text>
                  <Text size="xs" fs={'italic'} c="dimmed">{new Date(parseInt(tagsLastBackFill.id)).toLocaleString()}</Text>
                  <Text size="sm" c="dimmed">Performed by: {tagsLastBackFill.user}</Text>
                  <Group spacing="0">
                    <Text size="sm">Total: {tagsLastBackFill.results.total}</Text>
                    <Text size="sm">Success: {tagsLastBackFill.results.success}</Text>
                    <Text size="sm">Failed: {tagsLastBackFill.results.failed}</Text>
                  </Group>
                </Stack>
                {tagsLastBackFill.results.errors.length > 0 && 
                <Stack gap={0}>
                <Button variant={'subtle'} onClick={handleErrors.toggle} size="sm" c="dimmed">See errors <IconPlus size={15} /></Button>
                <Collapse in={backFillErrors}>
                  <Card p="md" bg={"var(--mantine-color-dark-9)"}>
                    <Stack spacing="sm">
                      {tagsLastBackFill.results.errors.map((error, index) => (
                        <Text key={index} size="sm" c="red">{error.error}</Text>
                      ))}
                    </Stack>
                  </Card>
                </Collapse>
                </Stack>
                }
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default TagUpdate;
