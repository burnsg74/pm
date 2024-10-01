module.exports = {
  apps: [
    {
      name: "pm",
      script: "./node-server/server.js",
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        PORT: 3001
      },
    },
  ],
}
