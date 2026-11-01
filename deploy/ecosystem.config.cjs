const path = require("node:path");

// fnm node, same as the other local apps. Override with PM_NODE if it moves.
const node =
  process.env.PM_NODE ||
  "/Users/greg/.local/share/fnm/node-versions/v24.18.1/installation/bin/node";

const root = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "pm-api",
      cwd: root,
      script: "backend/main.js",
      interpreter: node,
      // Optional gitignored overrides (VAULT_PATH, DATA_DIR, PORT).
      node_args: "--env-file-if-exists=.env.production",
      exec_mode: "fork",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: "4000",
      },
    },
  ],
};
