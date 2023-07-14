import React from "react";
import { Database, Workspace } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Text } from "@mantine/core";

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [workspaces, setWorkspaces] = useState<Array<Workspace>>([]);

  return (
    <div>
      <Text>admin view</Text>
    </div>
  );
};

export default AdminView;
