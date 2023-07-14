import {
  Navbar,
  ScrollArea,
  Button,
  NavLink,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database, Workspace } from "@/common/dbTypes";
import Link from "next/link";
import { UserFooter } from "./UserFooter";

export const AppNavBar = ({ opened }: { opened: boolean }) => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [workspaces, setWorkspaces] = useState<Array<Workspace>>([]);

  useEffect(() => {
    async function loadData() {
      // const { data, error } = await supabaseClient
      //   .from("workspace_members")
      //   .select("workspaces (id, name)");
      const { data, error } = await supabaseClient
        .from("workspaces")
        .select("*");
      console.log(data);
      if (!error) setWorkspaces(data);
    }
    // Only run query once user is logged in.
    if (user) loadData();
  }, [user]);

  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
    >
      <Navbar.Section>
        <Link href="/">Linkbrarian</Link>
      </Navbar.Section>
      <Navbar.Section grow component={ScrollArea} mt="md">
        {workspaces.map((w) => (
          <Link key={w.id} href={"/dashboard/workspaces/" + w.id}>
            <NavLink label={w.name} />
          </Link>
        ))}
      </Navbar.Section>
      <Navbar.Section>
        <UserFooter />
      </Navbar.Section>
    </Navbar>
  );
};
