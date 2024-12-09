import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth";
import { Group, Button, Text, Burger, Title, Box, Anchor, ActionIcon, Popover, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSettings } from "@tabler/icons-react";

function Navigation() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure(false);

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