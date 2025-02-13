const amqp = require("amqplib");
const { NotFound } = require("http-errors");
const { sequelize, Order, Address, Category } = require("../models");
const { setKey } = require("./redis");

// 创建全局的 RabbitMQ 连接和通道
let connection;
let channel;

/**
 * 连接到 RabbitMQ
 * @returns {Promise<*>}
 */
const connectToRabbitMQ = async () => {
  if (connection && channel) return; // 如果已经连接，直接返回

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue("order_queue", { durable: true });
  } catch (error) {
    console.error("RabbitMQ 连接失败：", error);
  }
};

/**
 * 订单队列消费者（接收消息）
 */
const orderConsumer = async () => {
  try {
    await connectToRabbitMQ();
    channel.consume(
      "order_queue",
      async (msg) => {
        let t;
        try {
          const orderid = msg.content.toString();
          const orderKey = `order:${orderid}`;
          let order = await Order.findOne({
            where: { orderid },
          });
          if (!order) {
            // 特殊处理
            setKey(orderKey, { msg: "not found" });
            throw new NotFound("订单不存在！");
          }
          setKey(orderKey, order);
          if (order.status === 0) {
            t = await sequelize.transaction();
            // 超时未支付，取消订单
            order = await order.update(
              {
                status: 2,
              },
              {
                transaction: t,
              }
            );
            setKey(orderKey, order);
            // 回加库存
            let category = await Category.findByPk(order.categoryId, {
              lock: true,
              transaction: t,
            });
            console.log("111", order.categoryId, category);
            category = await category.update(
              {
                inventory: category.inventory + 1,
              },
              {
                lock: true,
                transaction: t,
              }
            );
            setKey(`category:${order.dataValues.categoryId}`, category);
            t.commit();
          }
        } catch (e) {
          if (t && !t.finished) t.rollback();
          console.log(e);
        }
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error("订单队列消费者错误：", error);
  }
};

module.exports = {
  orderConsumer,
};
