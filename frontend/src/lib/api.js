// The frontend only ever talks to /api/*, never to disk.
async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${res.status} ${res.statusText}`);
  return json;
}

const filePath = (p) => p.split("/").map(encodeURIComponent).join("/");

export const api = {
  state: () => request("GET", "/state"),
  batch: (ops) => request("POST", "/batch", { ops }),
  files: () => request("GET", "/files"),
  putFile: (path, content) => request("PUT", `/files/${filePath(path)}`, { content }),
  health: () => request("GET", "/health"),
};
