import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery } from "react-query";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React from "react";
import { Bookmark, Database, Directory, User, Workspace } from "../common/dbTypes";

const WorkspaceContext = createContext({
  setWorkspaceId: (_: string) => {},
  data: null as Workspace | null,
  directories: null as Array<Directory> | null,
  bookmarks: null as Array<Bookmark> | null,
  members: null as Array<User> | null,
  state: "ok",
  refetch: () => {},
});

const useWorkspace = () => useContext(WorkspaceContext);

const WorkspaceContextProvider = ({ children }: { children: ReactNode }) => {
  const [workspaceId, setWorkspaceId] = React.useState<string>("");
  const [workspaceData, setWorkspaceData] = React.useState<Workspace | null>(null);
  const [directoriesData, setDirectoriesData] = React.useState<Array<Directory> | null>(
    null,
  );
  const [bookmarksData, setBookmarksData] = React.useState<Array<Bookmark> | null>(null);
  const [membersData, setMembersData] = React.useState<Array<User> | null>(null);
  const [workspaceState, setWorkspaceState] = React.useState<string>("ok");
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();

  async function fetchData(quiet?: boolean) {
    if (!user?.id) return;
    setWorkspaceState("loading");
    const [
      { data: workspaceData, error: workspaceError },
      { data: directoriesData, error: directoriesError },
      { data: bookmarksData, error: bookmarksError },
      { data: membersData, error: membersError },
    ] = await Promise.all([
      await supabaseClient.from("workspaces").select("*").eq("id", workspaceId).limit(1),
      await supabaseClient
        .from("directories")
        .select("*")
        .eq("workspace_id", workspaceId),
      await supabaseClient.from("bookmarks").select("*").eq("workspace_id", workspaceId),
      await supabaseClient
        .from("workspace_members")
        .select("users(*)")
        .eq("workspace_id", workspaceId),
    ]);

    console.log({ workspaceError, directoriesError, bookmarksError, membersData });

    // @ts-ignore
    setWorkspaceData(workspaceData?.[0]);
    setDirectoriesData(directoriesData);
    setBookmarksData(bookmarksData);
    // @ts-ignore
    setMembersData(membersData?.map(({ users }) => users));
    setWorkspaceState("ok");
  }

  React.useEffect(() => {
    fetchData();
  }, [workspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        setWorkspaceId,
        data: workspaceData,
        directories: directoriesData,
        bookmarks: bookmarksData,
        members: membersData,
        state: workspaceState,
        refetch: () => {
          fetchData(true);
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export { WorkspaceContextProvider, useWorkspace };
