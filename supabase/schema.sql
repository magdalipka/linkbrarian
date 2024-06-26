
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE SCHEMA IF NOT EXISTS "supabase_migrations";

ALTER SCHEMA "supabase_migrations" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."delete_all_tokens"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
delete from public.access_tokens
where user_id = auth.uid();
end;
$$;

ALTER FUNCTION "public"."delete_all_tokens"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."generate_new_token"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare token_id text;
begin
insert into public.access_tokens(id, user_id)
values( concat(gen_random_uuid(), gen_random_uuid()), auth.uid())
returning id as token_id into token_id;
return token_id;
end;
$$;

ALTER FUNCTION "public"."generate_new_token"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
insert into public.pending_registrations(user_id, email)
values(new.id, new.email);
return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_workspace"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
insert into public.workspace_members(workspace_id, user_id, role)
values(new.id, auth.uid(), 'owner');
return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_workspace"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."access_tokens" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."access_tokens" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "screenshot" "text"
);

ALTER TABLE "public"."bookmarks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."directories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "parent_id" "uuid",
    "workspace_id" "uuid" NOT NULL
);

ALTER TABLE "public"."directories" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL
);

ALTER TABLE "public"."invitations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."pending_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL
);

ALTER TABLE "public"."pending_registrations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "display_name" "text" NOT NULL,
    "system_role" "text" DEFAULT 'user'::"text" NOT NULL,
    "nick" "text" NOT NULL
);

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL
);

ALTER TABLE "public"."workspace_members" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL
);

ALTER TABLE "public"."workspaces" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "supabase_migrations"."schema_migrations" (
    "version" "text" NOT NULL,
    "statements" "text"[],
    "name" "text"
);

ALTER TABLE "supabase_migrations"."schema_migrations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."access_tokens"
    ADD CONSTRAINT "access_tokens_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."directories"
    ADD CONSTRAINT "directories_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."pending_registrations"
    ADD CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("nick");

ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("workspace_id", "user_id");

ALTER TABLE ONLY "supabase_migrations"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");

CREATE OR REPLACE TRIGGER "on_new_workspace" AFTER INSERT ON "public"."workspaces" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_workspace"();

ALTER TABLE ONLY "public"."access_tokens"
    ADD CONSTRAINT "access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");

ALTER TABLE ONLY "public"."directories"
    ADD CONSTRAINT "directories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."directories"("id");

ALTER TABLE ONLY "public"."directories"
    ADD CONSTRAINT "directories_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");

ALTER TABLE ONLY "public"."pending_registrations"
    ADD CONSTRAINT "pending_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."access_tokens" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."pending_registrations" FOR DELETE TO "authenticated" USING ((( SELECT "users"."system_role"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"text"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."access_tokens" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "Enable read access to admins" ON "public"."pending_registrations" FOR SELECT TO "authenticated" USING ((( SELECT "users"."system_role"
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())) = 'admin'::"text"));

ALTER TABLE "public"."access_tokens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can approve users = create profile" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "users_1"."system_role"
   FROM "public"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())) = 'admin'::"text"));

ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."directories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "individuals can view their own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));

ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."pending_registrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user can create new workspace" ON "public"."workspaces" FOR INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "user can delete owned workspaces" ON "public"."workspaces" FOR DELETE TO "authenticated" USING (("id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE (("workspace_members"."user_id" = "auth"."uid"()) AND ("workspace_members"."role" = 'owner'::"text")))));

CREATE POLICY "user can invite to joined workspaces" ON "public"."invitations" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));

CREATE POLICY "user can see bokmarks in joined workspaces" ON "public"."bookmarks" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));

CREATE POLICY "user can see directories in joined workspaces" ON "public"."directories" FOR SELECT TO "authenticated" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));

CREATE POLICY "user can see joined workspaces" ON "public"."workspace_members" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "user can see joined workspaces" ON "public"."workspaces" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE ("workspace_members"."user_id" = "auth"."uid"()))));

CREATE POLICY "user can see members of joined groups" ON "public"."workspace_members" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "user can update own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("system_role" = 'user'::"text"));

CREATE POLICY "user can update owned workspaces" ON "public"."workspaces" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE (("workspace_members"."user_id" = "auth"."uid"()) AND ("workspace_members"."role" = 'owner'::"text")))));

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can delete from owned workspaces" ON "public"."bookmarks" FOR DELETE TO "authenticated" USING (("workspace_id" IN ( SELECT "workspace_members"."workspace_id"
   FROM "public"."workspace_members"
  WHERE (("workspace_members"."user_id" = "auth"."uid"()) AND ("workspace_members"."role" = 'owner'::"text")))));

CREATE POLICY "users can invite to joined workspaces" ON "public"."workspace_members" FOR INSERT TO "authenticated" WITH CHECK (("workspace_id" IN ( SELECT "workspace_members_1"."workspace_id"
   FROM "public"."workspace_members" "workspace_members_1"
  WHERE ("workspace_members_1"."user_id" = "auth"."uid"()))));

CREATE POLICY "users can see profiles" ON "public"."users" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."delete_all_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_all_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_all_tokens"() TO "service_role";

GRANT ALL ON FUNCTION "public"."generate_new_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_new_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_new_token"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_workspace"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_workspace"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_workspace"() TO "service_role";

GRANT ALL ON TABLE "public"."access_tokens" TO "anon";
GRANT ALL ON TABLE "public"."access_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."access_tokens" TO "service_role";

GRANT ALL ON TABLE "public"."bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";

GRANT ALL ON TABLE "public"."directories" TO "anon";
GRANT ALL ON TABLE "public"."directories" TO "authenticated";
GRANT ALL ON TABLE "public"."directories" TO "service_role";

GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";

GRANT ALL ON TABLE "public"."pending_registrations" TO "anon";
GRANT ALL ON TABLE "public"."pending_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_registrations" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON TABLE "public"."workspace_members" TO "anon";
GRANT ALL ON TABLE "public"."workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_members" TO "service_role";

GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
