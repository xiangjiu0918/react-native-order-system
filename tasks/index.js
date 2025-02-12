const scheduleOrderCheck = require("./check-order");
const logger = require("../utils/logger");

/**
 * 初始化所有定时任务
 */
function initScheduleTasks() {
  try {
    // 启动订单超时检查任务
    scheduleOrderCheck();
  } catch (error) {
    logger.error("定时任务启动失败：", error);
  }
}

module.exports = initScheduleTasks;
