import React, { useState } from 'react';
import { Group, MultiSelect, Avatar, Text, Tooltip, ActionIcon } from '@mantine/core';
import { IconCheck, IconRestore } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { useGameData } from '../../context/DataContext';
import { Tag } from './Tags';

function MatchFilters({ filters, setFilters }) {
    const { getTags, champions, queuesSimplified, getChampIcon, getQueueIdsFromDisplayNames } = useGameData();
    const tagsList = getTags();
    const [searchParams, setSearchParams] = useSearchParams();

    const roles = searchParams.getAll("role") || null;
    const championIds = searchParams.getAll("championId").map(id => parseInt(id)) || null;
    const gameModes = searchParams.getAll("gameMode") || null;
    const queueIds = gameModes ? getQueueIdsFromDisplayNames(gameModes) : [];
    const tags = searchParams.getAll("tag") || null;
    const limit = parseInt(searchParams.get("limit")) || 10;


    const handleFilterChange = (newFilters) => {
        setSearchParams({
            role: newFilters.role || roles,
            championId: newFilters.championId || championIds,
            gameMode: newFilters.gameMode || gameModes,
            tag: newFilters.tag || tags,
        });
    };

    const tagsRenderOptions = ({ option, checked }) => (
        <Tag key={option.value} tag={tagsList.find(tag => tag.key === option.value)} />
    );

    return (
        <Group align="start" wrap="nowrap">
            <MultiSelect
                data={[
                    { label: "Top", value: "TOP" },
                    { label: "Jungle", value: "JUNGLE" },
                    { label: "Mid", value: "MIDDLE" },
                    { label: "Bot", value: "BOTTOM" },
                    { label: "Support", value: "UTILITY" }
                ]}
                value={roles}
                placeholder={roles.length ? "" : "All Roles"}
                withCheckIcon
                clearable
                onChange={(value) => handleFilterChange({ role: value })}
            />
            <MultiSelect
                data={[
                    ...Object.values(queuesSimplified).map((queue) => ({
                        label: queue,
                        value: queue
                    }))
                ]}
                searchable
                clearable
                withCheckIcon
                placeholder={gameModes.length ? "" : "All Game Modes"}
                value={gameModes}
                onChange={(value) => handleFilterChange({ gameMode: value })}
            />
            <MultiSelect
                data={[
                    ...Object.values(champions).map((champion) => ({
                        label: champion.name,
                        value: champion.key
                    }))
                ]}
                renderOption={({ option, checked }) => (
                    <Group gap={'xs'} align="center" justify="start">
                        {checked && <IconCheck size={18} />}
                        <Avatar src={getChampIcon(parseInt(option.value))} alt="champion icon" size={'sm'} bd={checked ? '2px solid white' : 'none'} />
                        <Text c={checked ? 'white' : 'dimmed'}>{option.label}</Text>
                    </Group>
                )}
                value={championIds.map(id => id.toString())}
                searchable
                clearable
                withCheckIcon
                placeholder={championIds.length ? "" : "All Champions"}
                onChange={(value) => handleFilterChange({ championId: value.map(id => parseInt(id)) })}
            />
            <MultiSelect
                data={[
                    ...tagsList.map((tag) => ({
                        label: tag.text,
                        value: tag.key
                    }))
                ]}
                renderOption={tagsRenderOptions}
                comboboxProps={{ width: 500, position: 'bottom-start' }}
                classNames={{ options: 'tag-options', option: 'tag-option' }}
                searchable
                clearable
                withCheckIcon
                placeholder={tags.length ? "" : "All Tags"}
                value={tags}
                onChange={(value) => handleFilterChange({ tag: value })}
            />
            <Tooltip label="Reset Filters" withArrow>
                <ActionIcon onClick={() => setSearchParams({})} color="blue">
                    <IconRestore />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}

export default MatchFilters;