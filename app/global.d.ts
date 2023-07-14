declare global {
  var db: {
    get: (query: string, params: unknown) => Promise<unknown>;
    run: (query: string, params: unknown) => Promise<unknown>;
    all: (query: string, params: unknown) => Promise<unknown>;
  };
  function connectToDb(): {
    get: (query: string, params: unknown) => Promise<unknown>;
    run: (query: string, params: unknown) => Promise<unknown>;
    all: (query: string, params: unknown) => Promise<unknown>;
  };
}

export {};
