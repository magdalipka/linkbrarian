import React from "react";
import { Workspace, Database } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Button, Text } from "@mantine/core";

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const [avatar, setAvatar] = useState();

  async function uploadFile() {
    const { data, error } = await supabaseClient.storage
      .from("avatars")
      .upload("/" + user?.id + "/avatar.png", avatar, {
        upsert: true,
      });
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  }

  return (
    <div>
      <Text>settings view</Text>
      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            setAvatar(img);
          }
        }}
      />
      <Button onClick={uploadFile}>save</Button>
    </div>
  );
};

export default AdminView;
