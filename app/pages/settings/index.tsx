import React, { useEffect } from "react";
import { Workspace, Database } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Button, Checkbox, FileButton, Group, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useProfile } from "@/common/useProfile";

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const profile = useProfile();

  const [avatar, setAvatar] = useState();

  const form = useForm({
    initialValues: {
      email: user?.email,
      nick: profile?.nick,
      display_name: profile?.display_name,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  useEffect(() => {
    form.setValues((prev) => ({ ...prev, ...profile }));
  }, [profile]);

  async function submit() {
    if (form.isTouched()) {
      await supabaseClient
        .from("users")
        .update({
          nick: form.values.nick,
          display_name: form.values.display_name,
        })
        .eq("id", user?.id);
      if (form.values.email !== user?.email) {
        const { data, error } = await supabaseClient.auth.updateUser({
          email: "new@email.com",
        });
      }
    }
    if (avatar) {
      const { data, error } = await supabaseClient.storage
        .from("avatars")
        .upload("/" + user?.id + "/avatar.png", avatar, {
          upsert: true,
        });
    }
  }

  return (
    <div>
      <FileButton onChange={setAvatar} accept="image/png,image/jpeg">
        {(props) => <Button {...props}>Upload image</Button>}
      </FileButton>
      <form onSubmit={submit}>
        <TextInput
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps("email")}
        />
        <TextInput withAsterisk label="Nick" {...form.getInputProps("nick")} />
        <TextInput withAsterisk label="Name" {...form.getInputProps("display_name")} />
        <Group position="right" mt="md">
          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            Submit
          </Button>
        </Group>
      </form>
    </div>
  );
};

export default AdminView;
