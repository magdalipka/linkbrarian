import { headers } from "../common/cors.ts";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../common/dbTypes.ts";

const supabaseClient = createClient<Database>(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const accessToken = req.headers.get("access-token")!;
  const { workspace_id, title, ...bookmark } = await req.json();

  const { data: userWrapper, error: userError } = await supabaseClient
    .from("access_tokens")
    .select("users(*)")
    .filter("id", "eq", accessToken)
    .single();

  if (userError) {
    console.log({ userError });
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 400,
      headers: headers(req),
    });
  } else {
    const { error } = await supabaseClient.from("bookmarks").insert({
      ...bookmark,
      name: title,
      workspace_id,
    });

    if (error) {
      console.log({ error });
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: headers(req),
      });
    } else {
      return new Response(JSON.stringify({ message: "ok" }), {
        status: 200,
        headers: headers(req),
      });
    }
  }
});
