module.exports = {
  apps: [
    {
      name: "pm",
      script: "./build/index.js",
      instances: 1,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
}
