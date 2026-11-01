// Entry point (pm2 and `npm start`). Binds loopback only.
import { resolveConfig } from "./config.js";
import { createApp } from "./server.js";

const config = resolveConfig();
const server = createApp(config);

server.listen(config.port, "127.0.0.1", () => {
  console.log(`pm-api ${config.mode} on http://127.0.0.1:${config.port}  data: ${config.dir}`);
});

function stop() {
  server.close(() => process.exit(0));
  server.closeAllConnections?.();
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
