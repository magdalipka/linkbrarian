import { URLs, ANON_KEY } from "@src/constants";
import React from "react";

type Auth = { accessToken: string } | null;

type Data = {
  workspaces: Array<{ id: string; name: string }> | null;
};

const DataContext = React.createContext({
  data: null as Data | null,
  setAuth: (() => {}) as (auth: Auth) => void,
  resetAuth: (() => {}) as () => void,
  state: "ok",
  saveCurrent: (() => {}) as (workspace_id: string) => void,
});

const useData = () => React.useContext(DataContext);

const DataContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = React.useState<Auth>(null);
  const [data, setData] = React.useState<Data | null>(null);
  const [dataState, setDataState] = React.useState<string>("ok");

  React.useEffect(() => {
    setDataState("loading");
    const localData = localStorage.getItem("auth");
    if (localData) {
      setAuth(JSON.parse(localData));
    }
    setDataState("ok");
  }, []);

  React.useEffect(() => {
    async function run() {
      if (!auth?.accessToken) return;
      setDataState("loading");

      const res = await fetch(URLs.remote + "/verify-token", {
        method: "GET",
        mode: "cors",
        credentials: "include",
        referrerPolicy: "origin",
        headers: {
          Authorization: ANON_KEY,
          "access-token": auth.accessToken,
        },
      });

      localStorage.setItem("auth", JSON.stringify(auth));

      setData({
        workspaces: (await res.json()).workspaces,
      });
      setDataState("ok");
    }
    run();
  }, [auth]);

  return (
    <DataContext.Provider
      value={{
        setAuth,
        resetAuth: () => {
          setAuth(null);
          setData(null);
          localStorage.removeItem("auth");
        },
        data: data,
        state: dataState,
        saveCurrent: async (workspace_id: string) => {
          const currentTab = (
            await browser.tabs.query({ active: true })
          )[0] as { title: string; url: string; id: number };
          const screenshot = (await browser.tabs.captureTab(
            currentTab.id
          )) as string;

          let bookmark = {
            title: currentTab.title,
            url: currentTab.url,
            screenshot,
            workspace_id,
          };

          console.log({ bookmark });

          await fetch(URLs.remote + "/add-via-token", {
            method: "POST",
            mode: "cors",
            credentials: "include",
            referrerPolicy: "origin",
            headers: {
              Authorization: ANON_KEY,
              "access-token": auth.accessToken,
            },
            body: JSON.stringify(bookmark),
          });
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContextProvider, useData };
