import { Flex, Input, Button, Text, VStack, Container } from "@chakra-ui/react";
import { useData } from "@src/context/dataContext";
import React from "react";

export const Workspaces = ({
  workspaces,
}: {
  workspaces: Array<{ id: string; name: string }>;
}) => {
  const data = useData();

  return (
    <VStack overflow="scroll">
      {workspaces.map((workspace) => (
        <Button
          key={workspace.id}
          width="100%"
          variant="ghost"
          colorScheme="purple"
          alignContent="center"
          onClick={() => {
            data.saveCurrent(workspace.id);
          }}
        >
          <Text>{workspace.name}</Text>
        </Button>
      ))}
    </VStack>
  );
};
