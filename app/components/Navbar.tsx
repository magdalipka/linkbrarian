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
import { useProfile } from "@/context/profileContext";

export const AppNavBar = ({ opened }: { opened: boolean }) => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const { workspaces } = useProfile();

  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
      <Navbar.Section>
        <Link href="/">Linkbrarian</Link>
      </Navbar.Section>
      <Navbar.Section grow component={ScrollArea} mt="md">
        {/* @ts-ignore */}
        {workspaces?.map((w) => (
          <Link key={"workspace_" + w.id} href={"/dashboard/workspaces/" + w.id}>
            <NavLink label={w.name} />
          </Link>
        ))}
        <Link key={"workspace_new"} href={"/dashboard/workspaces/new"}>
          <NavLink label="+" />
        </Link>
      </Navbar.Section>
      <Navbar.Section>
        <UserFooter />
      </Navbar.Section>
    </Navbar>
  );
};
