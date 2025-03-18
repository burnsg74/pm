module.exports = {
  apps: [
    {
      name: "pm",
      script: "fastify",
      args: ["start", "app.js"],
      instances: 1,
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },
  ],
}
