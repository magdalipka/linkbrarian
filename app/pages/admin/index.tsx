import React, { useEffect } from "react";
import { Database, Workspace } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Container, Text } from "@mantine/core";

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [usersToAccept, setUsersToAccept] = useState();

  useEffect(() => {
  }, [])

  return (
    <div>
      <Text>admin view</Text>
      <Container>
        <Text>accept new users</Text>
        
      </Container>
    </div>
  );
};

export default AdminView;
