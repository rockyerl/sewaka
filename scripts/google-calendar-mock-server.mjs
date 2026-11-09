import { createServer } from "node:http";

const events = new Map();
const stats = { token: 0, revoke: 0, list: 0, insert: 0, update: 0, delete: 0 };
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const json = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/__health") return json(200, { ok: true });
  if (url.pathname === "/__stats") return json(200, stats);
  if (url.pathname === "/token" && req.method === "POST") {
    stats.token += 1;
    return json(200, {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
      scope: "https://www.googleapis.com/auth/calendar.events",
    });
  }
  if (url.pathname === "/revoke" && req.method === "POST") {
    stats.revoke += 1;
    return json(200, {});
  }
  if (url.pathname === "/calendar/v3/calendars/primary/events" && req.method === "GET") {
    stats.list += 1;
    const workspaceId = url.searchParams.get("privateExtendedProperty")?.split("=").slice(1).join("=");
    return json(200, { items: [...events.values()].filter((event) => event.extendedProperties?.private?.sewakaWorkspaceId === workspaceId) });
  }
  const match = url.pathname.match(/^\/calendar\/v3\/calendars\/primary\/events(?:\/([^/]+))?$/);
  if (!match) return json(404, { error: "not found" });
  const eventId = decodeURIComponent(match[1] ?? "");
  if (req.method === "GET") {
    const event = events.get(eventId);
    return event ? json(200, event) : json(404, { error: "not found" });
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const payload = raw ? JSON.parse(raw) : {};
  if (req.method === "POST") {
    stats.insert += 1;
    events.set(payload.id, payload);
    return json(200, payload);
  }
  if (req.method === "PUT") {
    stats.update += 1;
    events.set(eventId, payload);
    return json(200, payload);
  }
  if (req.method === "DELETE") {
    stats.delete += 1;
    events.delete(eventId);
    res.writeHead(204);
    return res.end();
  }
  return json(405, { error: "method not allowed" });
});
server.listen(43129, "127.0.0.1");
