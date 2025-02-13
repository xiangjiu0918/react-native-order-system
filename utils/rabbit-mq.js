const amqp = require("amqplib");

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
 * 订单队列生产者（发送消息）
 */
const orderProducer = async (msg) => {
  try {
    await connectToRabbitMQ(); // 确保已连接

    channel.sendToQueue("order_queue", Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
  } catch (error) {
    console.error("订单队列生产者错误：", error);
  }
};

module.exports = {
  orderProducer,
};
