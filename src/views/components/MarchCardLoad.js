import React from 'react';
import { Card, Group, Loader } from '@mantine/core';

function MatchCardLoad(){
    return (
        <Card shadow="xs" padding="xl" radius="lg" bg={"var(--mantine-color-dark-8)"}>
            <Group align="center" justify="center" h={'130px'}>
            <Loader type='dots' />
            </Group>
        </Card>
    )
}

export default MatchCardLoad;