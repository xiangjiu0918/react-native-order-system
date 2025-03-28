// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "main-master",
      script: "./server.js",
      instances: 1, // 仅1个主进程
      autorestart: true,
    },
    {
      name: "api-worker",
      script: "./bin/www",
      instances: 2, // CPU核心数
      exec_mode: "cluster", // PM2集群模式
      autorestart: true,
    },
  ],
};
