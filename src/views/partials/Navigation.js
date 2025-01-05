import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth";
import {
    Group,
    Button,
    Text,
    Burger,
    Title,
    Box,
    Anchor,
    ActionIcon,
    Popover,
    Stack,
    Tooltip,
    Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation} from "@apollo/client";
import {IconRefresh, IconSettings} from "@tabler/icons-react";
import { UPDATE_ALL_SUMMONERS_MUTATION } from "../../graphql/updateAllSummonersMutation";
import React, {useState} from "react";
import {useGameData} from "../../context/DataContext";

function Navigation() {
    const { refreshAllData } = useGameData();
  const auth = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState(null);

    const [updateSummoners] = useMutation( UPDATE_ALL_SUMMONERS_MUTATION , {
        onCompleted: () => {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => setSuccess(false), 3000); // Clear success after 3s
        },
        onError: (error) => {
            setErrorUpdate(error.message);
            setLoading(false);
        }
    });

    const update = async () => {
        try {
            setLoading(true);
            setErrorUpdate(null);
            await updateSummoners();
            setLoading(false);
            await refreshAllData();
        } catch (e) {
            setErrorUpdate(e.message);
            setLoading(false);
        }
    };

  function UserTools() {
    if (!auth.user) {
      return (
        <Group gap="md">
          <Anchor component={Link} to="/register" c="dimmed">
            Register
          </Anchor>
          <Button component={Link} to="/login" variant="filled">
            Login
          </Button>
        </Group>
      );
    }
    return (
      <Group gap="md">
        <Text c="dimmed">Logged in as {auth.user}</Text>
        <Popover width={200} position="bottom" withArrow>
          <Popover.Target>
            <ActionIcon onClick={toggle}>
              <IconSettings />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="md">
            <Text>
              <Anchor c="dimmed" size="sm" component={Link} to="/tag-update">Edit tag settings</Anchor>
            </Text>
              <Button 
                onClick={() => {
                  auth.signout(() => navigate("/"));
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>
          <Tooltip label={"Update all summoners and match history"}>
              <ActionIcon onClick={update}>
                  {loading ? <Loader size={10} color={'dark'} /> :<IconRefresh />}
              </ActionIcon>
          </Tooltip>
      </Group>
    );
  }

  return (
      <Group justify="space-between" align="center" p={"10px 20px"} h={60}>
        <Group>
         <Anchor component={Link} to="/" >Joebalytics</Anchor>
        </Group>
        <UserTools />
      </Group>
  );
}

export default Navigation;