import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Database, Directory, Bookmark } from "./dbTypes";

export const useWorkspace = (workspaceId?: string) => {
  const supabaseClient = useSupabaseClient<Database>();
  const [directories, setDirectories] = useState<Array<Directory>>();
  const [bookmarks, setBookmarks] = useState<Array<Bookmark>>();
  useEffect(() => {
    console.log({ useWorkspace: { workspaceId } });
    if (!workspaceId) return;
    async function fetchDirectories() {
      const { data, error } = await supabaseClient
        .from("directories")
        .select("*")
        .eq("workspace_id", workspaceId);
      console.log({ data, error });
      setDirectories(data);
    }
    async function fetchBookmarks() {
      const { data, error } = await supabaseClient
        .from("bookmarks")
        .select("*")
        .eq("workspace_id", workspaceId);
      console.log({ data, error });
      setBookmarks(data);
    }
    fetchDirectories();
    fetchBookmarks();
  }, [workspaceId]);

  return {
    directories,
    bookmarks,
    filter: (filters: { parentId: string }) => {
      directories: directories?.filter((d) => d.parent_id === filters.parentId);
      bookmarks: bookmarks?.filter((d) => d.parent_id === filters.parentId);
    },
  };
};
