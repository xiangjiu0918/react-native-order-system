const { RateLimiterMySQL } = require("rate-limiter-flexible");
const { sequelize } = require("../models");
const { failure } = require("../utils/responses");
const { TooManyRequests } = require("http-errors");

const rateLimiter = new RateLimiterMySQL({
  storeClient: sequelize,
  keyPrefix: "middleware",
  points: 100, // 10 requests
  duration: 1, // per 1 second
});

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
