import React from "react";
import { Database, Workspace } from "@/common/dbTypes";
import {
  Text,
  useMantineTheme,
  Menu,
  Button,
  NavLink,
  Image,
  Avatar,
} from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import Link from "next/link";
import { useProfile } from "@/context/profileContext";
import {
  IconHome2,
  IconGauge,
  IconChevronRight,
  IconActivity,
  IconCircleOff,
  IconSettings,
  IconShieldLock,
  IconLogout,
} from "@tabler/icons-react";
import { COLORS } from "@/common/colors";

export const UserFooter = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const profile = useProfile();
  const [avatarUrl, setAvatarUrl] = React.useState();

  React.useEffect(() => {
    const { data } = supabaseClient.storage
      .from("avatars")
      .getPublicUrl(user?.id + "/avatar.png");
    // @ts-ignore
    setAvatarUrl(data);
  }, [profile.data]);

  return (
    <div>
      <Menu position="right-end" withArrow arrowPosition="center">
        <Menu.Target>
          <NavLink
            label={profile.data?.display_name}
            description={"@" + profile.data?.nick}
            rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
            // @ts-ignore
            icon={<Avatar src={avatarUrl?.publicUrl} />}
          />
        </Menu.Target>

        <Menu.Dropdown>
          <Link href="/settings">
            <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
          </Link>
          {profile.data?.system_role === "admin" ? (
            <Link href="/admin">
              <Menu.Item icon={<IconShieldLock size="0.8rem" stroke={1.5} />}>
                Admin panel
              </Menu.Item>
            </Link>
          ) : (
            <></>
          )}
          <Menu.Item
            color={COLORS.red}
            icon={<IconLogout size="0.8rem" stroke={1.5} />}
            onClick={() => supabaseClient.auth.signOut()}
          >
            <Text>Sign out</Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
