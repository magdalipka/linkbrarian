import { headers } from "../common/cors.ts";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../common/dbTypes.ts";

const supabaseClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const accessToken = req.headers.get("access-token")!;

  let { data: tokenData, error: tokenError } = await supabaseClient
    .from("access_tokens")
    .select("*")
    .filter("id", "eq", accessToken)
    .single();

  console.log(JSON.stringify({ accessToken, tokenData, tokenError }));

  if (tokenError) {
    return new Response(JSON.stringify({ error: "Unable to validate token" }), {
      status: 403,
      headers: headers(req),
    });
  }

  if (req.method === "OPTIONS") {
    return new Response(JSON.stringify({ message: "ok" }), {
      status: 200,
      headers: headers(req),
    });
  } else {
    let { data: workspacesWrapper, error: workspacesError } = await supabaseClient
      .from("workspace_members")
      .select("workspaces(*)")
      .filter("user_id", "eq", tokenData?.user_id);

    console.log(JSON.stringify({ workspacesWrapper, workspacesError }));

    if (workspacesError) {
      return new Response(JSON.stringify({ error: "Unable to fetch workspaces" }), {
        status: 500,
        headers: headers(req),
      });
    }

    let workspaces = (workspacesWrapper || []).map(({ workspaces }) => workspaces);

    return new Response(JSON.stringify({ workspaces }), {
      status: 200,
      headers: headers(req),
    });
  }
});
