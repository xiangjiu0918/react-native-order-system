const {
  RateLimiterCluster,
  BurstyRateLimiter,
} = require("rate-limiter-flexible");
const numCPUs = require("node:os").cpus().length;
const { failure } = require("../utils/responses");
const { TooManyRequests } = require("http-errors");

const rateLimiter = new BurstyRateLimiter(
  new RateLimiterCluster({
    keyPrefix: "myclusterlimiter", // Must be unique for each limiter
    points: numCPUs * 5,
    duration: 1,
  }),
  new RateLimiterCluster({
    keyPrefix: "myclusterlimiter", // Must be unique for each limiter
    points: numCPUs * 45,
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
