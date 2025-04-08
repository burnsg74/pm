module.exports = {
  apps: [
    {
      name: "jobs-websocket",
      script: "websocket-server.js",
      instances: 1,
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      }
    },
  ],
}