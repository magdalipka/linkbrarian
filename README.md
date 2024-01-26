# Linkbrarian

Aplikacja do udostępniania zakładek. Składa się z trzech części: backend, frontend, wtyczka.

## Technologie

- Deno
- Postgres
- Firefox Web Extensions
- NextJS, React

## Backend

- dwie edge functions: do weryfikacji access tokenu i zapisywania danych (przy pomocy access tokenu)
- poza tym cała logika dzieje się w bazie danych, [supabase/schema.sql](supabase/schema.sql) - zawiera wszyskie definicje tabel, funkcji, triggerów oraz autoryzacji dostępu

## Frontend

Aplikacja typu SPA w Reactie. 

## Wtyczka

React z dostępem do API przeglądarki.

## Uruchomienie aplikacji

### Backend

1. Instalacja runnera: https://supabase.com/docs/guides/cli/getting-started.
2. Należy posiadać również zainstalowanego Dockera.
3. `supabase start` - https://supabase.com/docs/guides/cli/local-development

### Frontend

```sh
cd app
npm i
npm run dev
```

### Wtyczka

```sh
cd plugin
npm i
npm run dev
```
a następnie załadować jako Temporary Extension: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/

## Działająca aplikacja

Backend jest wrzucony na hosting `supabase.com`. Frontend jest wrzucony na hosting `vercel.com`. https://linkbrarian.vercel.app/dashboard