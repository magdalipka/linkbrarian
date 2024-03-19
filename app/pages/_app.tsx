import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  Aside,
  Burger,
  Footer,
  MantineProvider,
  MediaQuery,
  useMantineTheme,
  Text,
  Button,
} from "@mantine/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AppShell, Navbar, Header } from "@mantine/core";
import { Auth } from "@supabase/auth-ui-react";
import { AppNavBar } from "../components/Navbar";
import {
  SessionContextProvider,
  useSessionContext,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import NextTopLoader from "nextjs-toploader";
import { IBM_Plex_Mono } from "next/font/google";
import { ProfileContextProvider, useProfile } from "@/context/profileContext";
import { IconLogout } from "@tabler/icons-react";
import { WorkspaceContextProvider } from "@/context/workspacesContext";
import { COLORS } from "@/common/colors";

const plexMono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

const App = ({ Component, pageProps, ...rest }: AppProps) => {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <main className={plexMono.className}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <ProfileContextProvider>
            <WorkspaceContextProvider>
              <AppPage {...{ Component, pageProps, ...rest }} />
            </WorkspaceContextProvider>
          </ProfileContextProvider>
        </SessionContextProvider>
      </MantineProvider>
    </main>
  );
};

const AppPage = ({ Component, pageProps }: AppProps) => {
  const theme = useMantineTheme();
  const { isLoading } = useSessionContext();
  const user = useUser();
  const profile = useProfile();
  const supabaseClient = useSupabaseClient();
  const [navbarOpened, setNavbarOpened] = useState(false);

  if (isLoading || profile.state === "loading") {
    return (
      <div>
        {/* Uncomment this in case of emergency */}
        {/* <Button color="red" onClick={() => supabaseClient.auth.signOut()}>
          <Text>Sign out</Text>
        </Button> */}
        <p>loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth
        redirectTo="https://linkbrarian.vercel.app/dashboard"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={["github"]}
        socialLayout="horizontal"
      />
    );
  }

  if (!profile?.data?.created_at) {
    return (
      <div>
        <div>
          <p>An error occurred. Try logginr in again.</p>
          <p>
            If the error persists there might be something wrong with your account - in
            that case contact your administrator.
          </p>
        </div>
        <Button color="red" onClick={() => supabaseClient.auth.signOut()}>
          <Text>Sign out</Text>
        </Button>
      </div>
    );
  }

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark" ? COLORS.grey : COLORS.white,
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={<AppNavBar opened={navbarOpened} />}
      // no idea how to make top panel be visible with side opened
      // header={
      //   <MediaQuery largerThan="sm" styles={{ display: "none" }}>
      //     <Burger
      //       opened={navbarOpened}
      //       onClick={() => setNavbarOpened((o) => !o)}
      //       size="sm"
      //       color={theme.colors.gray[6]}
      //       mr="xl"
      //     />
      //   </MediaQuery>
      // }
    >
      <NextTopLoader />
      <Component {...pageProps} />
    </AppShell>
  );
};

export default App;
