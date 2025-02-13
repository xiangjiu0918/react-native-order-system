const schedule = require("node-schedule");
const { sequelize, Order, Category } = require("../models");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const moment = require("moment");
const { delKey, setKey } = require("../utils/redis");

/**
 * 定时检查并处理超时未支付订单
 * 每十五分钟 执行一次
 */
function scheduleOrderCheck() {
  schedule.scheduleJob("0 * * * * *", async () => {
    const t = await sequelize.transaction();

    try {
      // 查找超时未支付的订单
      const expiredOrders = await Order.findAll({
        attributes: ["id", "categoryId", "orderid"],
        where: {
          status: 0,
          orderTime: {
            [Op.lt]: moment().subtract(1, "minute").toDate(),
          },
        },
        transaction: t,
      });

      // 已超时订单的 ID 列表
      let orderIds = [];
      // 分类和库存, key -- id, value -- 需要加的库存数;
      let categories = {};
      expiredOrders.forEach((order) => {
        // 把相关订单的缓存删掉
        delKey(`order:${order.orderid}`);
        orderIds.push(order.id);
        categories[order.categoryId] = categories[order.categoryId] + 1 || 1;
      });

      await Promise.all(
        [
          // 批量更新超时订单状态，减小数据库的开销
          Order.update(
            {
              status: 2, // 订单状态：已取消（超时）
            },
            {
              where: {
                id: orderIds,
              },
              transaction: t,
              lock: true,
            }
          ),
        ].concat(
          Object.keys(categories).map(async (categoryId) => {
            let category = await Category.findByPk(categoryId, {
              transaction: t,
              lock: true,
            });
            category = await category.update(
              {
                inventory: category.inventory + categories[categoryId],
              },
              { transaction: t, lcok: true }
            );
            // 更新缓存
            setKey(`category:${categoryId}`, category);
            return;
          })
        )
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      logger.error("定时任务处理超时订单失败：", error);
    }
  });
}

module.exports = scheduleOrderCheck;
