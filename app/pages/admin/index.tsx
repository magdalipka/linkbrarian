import React from "react";
import { Database, Workspace } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { ActionIcon, Button, Container, Group, Text } from "@mantine/core";
import { IconX, IconCheck } from "@tabler/icons-react";
import { COLORS } from "@/common/colors";

const PendingRegistration = ({
  registerInfo,
  reload,
}: {
  reload: () => unknown;
  registerInfo: {
    id: string;
    user_id: string;
    created_at: string;
    email: string;
  };
}) => {
  const supabaseClient = useSupabaseClient<Database>();

  async function processRegistration(accept: boolean) {
    await supabaseClient
      .from("pending_registrations")
      .delete()
      .filter("id", "eq", registerInfo.id);
    if (accept) {
      await supabaseClient.from("users").insert({
        id: registerInfo.user_id,
        display_name: registerInfo.email,
        nick: registerInfo.email,
      } as any);
    }
    reload();
  }

  return (
    <Group>
      <Text>{registerInfo.email}</Text>
      <ActionIcon
        variant="filled"
        color="red"
        aria-label="Reject"
        onClick={() => processRegistration(false)}
      >
        <IconX />
      </ActionIcon>
      <ActionIcon
        variant="filled"
        color="green"
        aria-label="Accept"
        onClick={() => processRegistration(true)}
      >
        <IconCheck />
      </ActionIcon>
    </Group>
  );
};

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [usersToAccept, setUsersToAccept] = React.useState<Array<any>>();
  const [reload, triggerReload] = React.useReducer(() => Math.random(), 0);

  React.useEffect(() => {
    async function run() {
      if (!user?.id) return;
      const { data, error } = await supabaseClient
        .from("pending_registrations")
        .select("*");
      console.log({ data });
      // @ts-ignore
      setUsersToAccept(data);
    }
    run();
  }, [user?.id, reload]);

  return (
    <div>
      <Text>Administration</Text>
      <Container>
        <Text>Newly registered users</Text>
        <Container>
          {!usersToAccept?.length ? (
            <div>No pending registrations</div>
          ) : (
            <Group>
              {usersToAccept.map((registration) => (
                <PendingRegistration
                  key={registration.id}
                  registerInfo={registration}
                  reload={triggerReload}
                />
              ))}
            </Group>
          )}
        </Container>
      </Container>
    </div>
  );
};

export default AdminView;
