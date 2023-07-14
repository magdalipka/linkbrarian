import { useRouter } from "next/router";
import React from "react";
import { Text } from "@mantine/core";

const WorkspaceView = () => {
  const router = useRouter();
  return (
    <div>
      <Text>workspace view</Text>
      <Text>{JSON.stringify(router.query)}</Text>
    </div>
  );
};

export default WorkspaceView;
