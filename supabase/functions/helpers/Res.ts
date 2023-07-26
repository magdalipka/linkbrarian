export class Res extends Response {
  constructor(body?: object, options?: ResponseInit) {
    super(JSON.stringify(body || {}), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        ...options?.headers,
      },
      ...options,
    });
  }
}
