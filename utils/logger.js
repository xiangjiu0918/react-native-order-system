const { createLogger, format, transports } = require('winston');
const MySQLTransport = require('winston-mysql');

// 读取 config/config.json 数据库配置文件
// 根据环境变量 NODE_ENV 来选择对应数据库配置
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const options = {
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  port: 3304,
  table: 'Logs'
};


const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),    // 添加错误堆栈信息
    format.json()
  ),
  defaultMeta: { service: 'ordersystem-api' },
  transports: [
    new MySQLTransport(options),            // 将日志写入数据库
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),                    // 终端中输出彩色的日志信息
      format.simple()
    )
  }));
}

module.exports = logger;
