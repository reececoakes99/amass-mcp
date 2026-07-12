export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = await fetch(`${origin}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "debug", version: "1.0.0" },
      },
    }),
  });
  const body = await response.text();
  return Response.json({ status: response.status, headers: Object.fromEntries(response.headers), body });
}
