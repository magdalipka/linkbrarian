import React, { FunctionComponent, useEffect } from "react";

import { browser } from "webextension-polyfill-ts";

import {
  Box,
  ChakraProvider,
  Text,
  Flex,
  extendTheme,
  Grid,
  GridItem,
  Button,
  Input,
  VStack,
} from "@chakra-ui/react";
import { DataContextProvider, useData } from "@src/context/dataContext";
import { TokenInput } from "@src/components/tokenInput";
import { Workspaces } from "@src/components/workspaces";

const theme = extendTheme({
  // fontSizes: {
  // lg: '18px',
  // },
  colors: {
    purple: { 400: "#b87ff7" },
    pink: { 400: "#f77fbe" },
    green: { 400: "#9db802" },
    grey: { 400: "#1f2335" },
    blacK: { 400: "#0d0f17" },
    white: { 400: "#fef9ff" }, //thin
    // white: "#d0ced2", //thick
  },
});

export const Popup: FunctionComponent = () => {
  useEffect(() => {
    browser.runtime.sendMessage({ popupMounted: true });
  }, []);

  return (
    <DataContextProvider>
      <ChakraProvider theme={theme}>
        <Box
          height={200}
          width={300}
          sx={{
            backgroundColor: "grey.400",
            color: "white.400",
          }}
        >
          <Flex
            height={200}
            width={300}
            alignContent="center"
            justifyItems="center"
            sx={{
              backgroundColor: "grey.400",
            }}
          >
            <App />
          </Flex>
        </Box>
      </ChakraProvider>
    </DataContextProvider>
  );
};

const App: FunctionComponent = () => {
  const data = useData();
  if (data.state === "loading") {
    return <Text>loading...</Text>;
  }
  if (!data.data) {
    return <TokenInput />;
  }

  return (
    <Flex justifyContent="space-between" direction="column" width="100%">
      <Workspaces workspaces={data.data.workspaces || []} />
      <Box>
        <Button variant="ghost" colorScheme="purple" onClick={data.resetAuth}>
          Reset token
        </Button>
      </Box>
    </Flex>
  );
};
