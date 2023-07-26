import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Grid, LoadingOverlay, Text } from "@mantine/core";
import { useWorkspace } from "@/common/useWorkspce";

const WorkspaceView = () => {
  const router = useRouter();
  const [workspaceId, seteWorkspaceId] = useState();

  useEffect(() => {
    seteWorkspaceId(router.query.id);
  }, [router]);

  const workspaceObjects = useWorkspace(workspaceId);

  return (
    <div>
      <Text>workspace view</Text>
      <Text>{JSON.stringify(workspaceId)}</Text>
      <Grid>
        {workspaceObjects.directories?.map((directory) => (
          <Grid.Col span={4}>{JSON.stringify(directory)}</Grid.Col>
        ))}
        {workspaceObjects.bookmarks?.map((bookmark) => (
          <Grid.Col span={4}>{JSON.stringify(bookmark)}</Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default WorkspaceView;
