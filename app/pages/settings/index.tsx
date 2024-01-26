import React from "react";
import { Workspace, Database } from "@/common/dbTypes";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  Button,
  Checkbox,
  Container,
  FileButton,
  Flex,
  Group,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useProfile } from "@/context/profileContext";

const AdminView = () => {
  const supabaseClient = useSupabaseClient<Database>();
  const user = useUser();
  const profile = useProfile();

  const [message, setMessage] = React.useState<string>();

  const [avatar, setAvatar] = React.useState();

  const form = useForm({
    initialValues: {
      email: user?.email,
      nick: profile.data?.nick,
      display_name: profile.data?.display_name,
    },

    validate: {
      // @ts-ignore
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  React.useEffect(() => {
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
    <Container>
      <Container>
        <Title>My profile</Title>
        {/* @ts-ignore */}
        <FileButton onChange={setAvatar} accept="image/png,image/jpeg">
          {(props) => <Button {...props}>Upload new image</Button>}
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
              onClick={async (e) => {
                e.preventDefault();
                await submit();
                profile.refetch();
              }}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Container>
      <Container>
        <Title>Access tokens</Title>
        <Flex gap="1em">
          <Button
            color="red"
            onClick={async () => {
              // @ts-ignore
              await supabaseClient.rpc("delete_all_tokens");
            }}
          >
            Delete all access tokens
          </Button>
          <Button
            onClick={async () => {
              // @ts-ignore
              const { data: newToken } = await supabaseClient.rpc("generate_new_token");
              // @ts-ignore
              setMessage(
                "New token: " +
                  JSON.stringify(newToken) +
                  " - it will never be shown again.",
              );
            }}
          >
            Get new access token
          </Button>
          <Text>{message}</Text>
        </Flex>
      </Container>
    </Container>
  );
};

export default AdminView;
