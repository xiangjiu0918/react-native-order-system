const createError = require("http-errors");
const multer = require("multer");
const logger = require("./logger");

function success(res, message, data, code) {
  return res.status(code || 200).json({
    status: true,
    message,
    data,
  });
}

function failure(res, e, message) {
  // 默认响应为 500，服务器错误
  let statusCode = 500;
  let errors = "服务器错误";
  if (
    e.name === "SequelizeValidationError" ||
    e.name === "SequelizeUniqueConstraintError"
  ) {
    statusCode = 400;
    errors = e.errors.map((item) => item.message);
    message = "数据验证失败";
  } else if (e.name === "SequelizeOptimisticLockError") {
    statusCode = 409;
    errors = "请求冲突，您提交的数据已被修改，请稍后重试。";
  } else if (e.name === "JsonWebTokenError") {
    statusCode = 401;
    errors = "您提交的 token 错误。";
    message = "认证失败";
  } else if (e.name === "TokenExpiredError") {
    statusCode = 401;
    errors = "您的 token 已过期。";
    message = "认证失败";
  } else if (e instanceof createError.HttpError) {
    statusCode = e.status;
    errors = e.message;
  } else if (e instanceof multer.MulterError) {
    if (e.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      errors = "文件大小超出限制。";
    } else {
      statusCode = 400;
      errors = e.message;
    }
  } else {
    logger.error(errors, e);
  }
  res.status(statusCode).json({
    status: false,
    message: message || `请求失败: ${e.name}`,
    errors: Array.isArray(errors) ? errors : [errors],
  });
}

module.exports = {
  success,
  failure,
};
