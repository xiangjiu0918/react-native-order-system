const amqp = require("amqplib");
const { delKey, setKey, getKeysByPattern } = require("../utils/redis");

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
    // 断言exchange
    await channel.assertExchange("delay_exchange", "x-delayed-message", {
      durable: true,
      "x-delayed-type": "direct",
    });
    // 断言queue
    await channel.assertQueue("order_queue", { durable: true });
    // 将queue绑定到exchange
    channel.bindQueue("order_queue", "delay_exchange", "delay_key");
  } catch (error) {
    console.error("RabbitMQ 连接失败：", error);
  }
};

/**
 * 订单队列生产者（发送消息）
 */
const delayOrderProducer = async (msg, delay) => {
  try {
    await connectToRabbitMQ(); // 确保已连接

    channel.publish("delay_exchange", "delay_key", Buffer.from(msg), {
      persistent: true,
      headers: {
        "x-delay": delay,
      },
    });
  } catch (error) {
    console.error("订单队列生产者错误：", error);
  }
};

/**
 * 订单队列消费者（接收消息）
 */
const orderConsumer = async () => {
  try {
    await connectToRabbitMQ();
    channel.consume(
      "ali_queue",
      async (msg) => {
        let t;
        try {
          console.log(msg.content.toString());
          const { method, key, value } = JSON.parse(msg.content.toString());
          switch (method) {
            case "setKey":
              setKey(key, value);
              break;
            case "delKey":
              delKey(key, value);
              break;
            case "delAll":
              if (key === "order") {
                const [orderKeys, unpayOrderKeys] = await Promise.all([
                  getKeysByPattern("orders:*"),
                  getKeysByPattern("unpay-orders:*"),
                ]);

                if (orderKeys.length !== 0 || unpayOrderKeys.length !== 0) {
                  await delKey([...orderKeys, ...unpayOrderKeys]);
                }
              }
              break;
          }
        } catch (e) {
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
  delayOrderProducer,
  orderConsumer,
};
