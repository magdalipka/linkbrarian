export const headers = (req: Request) => {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers":
      "Content-Type, Content-Length, Accept-Encoding, Authorization, accept, origin, Cache-Control, X-Requested-With",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET, PUT, DELETE",
  };
};
