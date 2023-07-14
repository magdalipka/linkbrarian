import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Database, User } from "./dbTypes";

export const useProfile = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [data, setData] = useState<User>();
  useEffect(() => {
    async function run() {
      const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .limit(1)
        .single();
      setData(data);
    }
    run();
  }, []);

  return data;
};
