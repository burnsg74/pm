// PM API. node:http only, loopback bound, no auth (local machine only).
import { createServer } from "node:http";
import { ValidationError } from "./schema.js";
import { NotFoundError, PathError, createStore } from "./store.js";

const MAX_BODY = 5 * 1024 * 1024;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, "Body too large");
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}

export function createApp(config, store = createStore(config.dir)) {
  async function handle(req, res) {
    const url = new URL(req.url, "http://localhost");
    const method = req.method;
    let segments;
    try {
      segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    } catch {
      throw new HttpError(400, "Malformed URL");
    }
    if (segments[0] !== "api") throw new HttpError(404, "Not found");
    const [, resource, ...rest] = segments;

    if (resource === "health" && method === "GET") {
      const h = await store.health();
      return send(res, h.readable ? 200 : 503, { ok: h.readable, env: config.mode, dataDir: h.dir, ...(h.error ? { error: h.error } : {}) });
    }

    if (resource === "state" && method === "GET") {
      return send(res, 200, await store.readAll());
    }

    if (resource === "batch" && method === "POST") {
      const body = await readJson(req);
      return send(res, 200, await store.applyBatch(body.ops));
    }

    if (resource === "files") {
      if (rest.length === 0) {
        if (method !== "GET") throw new HttpError(405, "Method not allowed");
        return send(res, 200, { files: await store.listFiles() });
      }
      const rel = rest.join("/");
      if (method === "GET") return send(res, 200, await store.readFileEntry(rel));
      if (method === "PUT") return send(res, 200, await store.writeFileEntry(rel, await readJson(req)));
      throw new HttpError(405, "Method not allowed");
    }

    throw new HttpError(404, "Not found");
  }

  const server = createServer((req, res) => {
    handle(req, res).catch((err) => {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      if (err instanceof ValidationError) return send(res, 400, { error: err.message });
      if (err instanceof PathError) return send(res, 400, { error: err.message });
      if (err instanceof NotFoundError) return send(res, 404, { error: err.message });
      console.error(err);
      send(res, 500, { error: err.message || "Server error" });
    });
  });
  server.store = store;
  return server;
}
