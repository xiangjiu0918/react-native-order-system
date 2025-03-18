const cluster = require("cluster");
const os = require("os");

require("dotenv").config();

const initServer = require("./bin/www");

if (cluster.isPrimary) {
  const { RateLimiterClusterMaster } = require("rate-limiter-flexible");
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  new RateLimiterClusterMaster();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // 监听子进程退出并尝试重启
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.id} died. Restarting...`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} is running`);
  initServer();
}
