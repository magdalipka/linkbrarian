import { useQuery } from "react-query";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React from "react";
import { Database, User, Workspace } from "../common/dbTypes";

const ProfileContext = React.createContext({
  data: {} as User | null,
  workspaces: Array<Workspace>,
  state: "ok",
  refetch: () => {},
});

const useProfile = () => React.useContext(ProfileContext);

const ProfileContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileData, setProfileData] = React.useState<User | null>(null);
  const [profileState, setProfileState] = React.useState<string>("ok");
  const [workspaces, setWorkspaces] = React.useState<Array<Workspace> | null>(null);
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();

  async function fetchData(quiet?: boolean) {
    if (!user?.id) return;
    if (!quiet) {
      setProfileState("loading");
    }
    console.log("here");
    const { data: profileData, error: profileError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .limit(1);
    if (profileError) {
      console.log({ profileError });
    }

    const { data: workspacesData, error: workspacesError } = await supabaseClient
      .from("workspaces")
      .select("*");
    if (workspacesError) {
      console.log({ workspacesError });
    }

    console.log({ profileData, workspacesData });

    // @ts-ignore
    setProfileData(profileData?.[0]);
    setWorkspaces(workspacesData);
    setProfileState("ok");
  }

  React.useEffect(() => {
    console.log({ user });
    fetchData();
  }, [user?.id]);

  return (
    <ProfileContext.Provider
      value={{
        data: profileData,
        state: profileState,
        // @ts-ignore
        workspaces,
        refetch: () => {
          fetchData(true);
        },
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export { ProfileContextProvider, useProfile };
