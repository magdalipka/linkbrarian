// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Res } from "../helpers/Res.ts";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
  );
  const {
    data: { user },
    error: getAuthUserError,
  } = await supabaseClient.auth.getUser();

  if (getAuthUserError) {
    console.error(getAuthUserError);
    return new Res({ message: "Internal server error" }, { status: 500 });
  }
  if (!user) {
    console.error();
    return new Res({ message: "Unauthorized" }, { status: 403 });
  }

  const { data, error: getUserError } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", user?.id)
    .limit(1)
    .single();

  if (getUserError) {
    console.error(getUserError);
    return new Res({ message: "Internal server error" }, { status: 500 });
  }

  if (data.system_role !== "admin") {
    return new Res({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    switch (req.method) {
      case "GET": {
        const data = await getNewUsers();
        return new Res(data, {
          status: 200,
        });
      }
      case "PATCH": {
        break;
      }
    }

    return new Res(
      {},
      {
        status: 204,
      },
    );
  } catch (error) {
    console.error(error);
    return new Res(
      { message: "Internal server error" },
      {
        status: 500,
      },
    );
  }
});

async function getNewUsers(): Promise<Array<unknown>> {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data, error } = await supabaseClient.from("pending_registrations").select("*");
  if (error) {
    throw error;
  }
  return data;
}

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'

