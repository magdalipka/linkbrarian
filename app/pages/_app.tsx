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

const App = ({ Component, pageProps, ...rest }: AppProps) => {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        /** Put your mantine theme override here */
        colorScheme: "light",
      }}
    >
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <AppPage {...{ Component, pageProps, ...rest }} />
      </SessionContextProvider>
    </MantineProvider>
  );
};

const AppPage = ({ Component, pageProps }: AppProps) => {
  const theme = useMantineTheme();
  const { isLoading } = useSessionContext();
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [navbarOpened, setNavbarOpened] = useState(false);

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!user)
    return (
      <Auth
        redirectTo="http://localhost:3000/dashboard"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={["google", "github"]}
        socialLayout="horizontal"
      />
    );

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
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
