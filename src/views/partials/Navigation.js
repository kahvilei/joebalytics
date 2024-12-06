import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth";
import { Group, Button, Text, Burger, Title, Box, Anchor } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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
        <Button 
          onClick={() => {
            auth.signout(() => navigate("/"));
          }}
        >
          Sign out
        </Button>
      </Group>
    );
  }

  return (
      <Group justify="space-between" align="center" p={5} h={60}>
        <Group>
          <Title order={4}>Joebalytics</Title>
        </Group>
        <UserTools />
      </Group>
  );
}

export default Navigation;