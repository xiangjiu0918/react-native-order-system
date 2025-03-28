// app-master.js
const pm2 = require("pm2");
const { RateLimiterClusterMasterPM2 } = require("rate-limiter-flexible");
console.log(`Master ${process.pid} is running`);
new RateLimiterClusterMasterPM2(pm2);
