const {
  RateLimiterCluster,
  BurstyRateLimiter,
  // RateLimiterMemory,
} = require("rate-limiter-flexible");
const numCPUs = require("node:os").cpus().length;
const { failure } = require("../utils/responses");
const { TooManyRequests } = require("http-errors");

const rateLimiter = new BurstyRateLimiter(
  new RateLimiterCluster({
    keyPrefix: "commonlimiter", // Must be unique for each limiter
    points: numCPUs * 5,
    duration: 1,
  }),
  new RateLimiterCluster({
    keyPrefix: "outBrustlimiter", // Must be unique for each limiter
    points: numCPUs * 60,
    duration: 60,
  })
);

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.path)
    .then(() => {
      next();
    })
    .catch(() => {
      failure(res, new TooManyRequests());
    });
};

module.exports = rateLimiterMiddleware;
