const express = require("express");
const router = express.Router();
const {
  sequelize,
  Order,
  Address,
  Category,
  Size,
  Type,
  Good,
} = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest } = require("http-errors");
const { delKey, getKey, setKey, getKeysByPattern } = require("../utils/redis");
const { Op, where } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const { delayOrderProducer } = require("../utils/rabbit-mq");

/**
 * 过滤输入
 * @returns {Object}
 */
function filterBody(req) {
  return {
    userId: req.userId,
    goodId: req.body.goodId,
    categoryId: req.body.categoryId,
    addressId: req.body.addressId,
    num: req.body.num,
  };
}

/**
 * 清除缓存
 * @returns {Promise<void>}
 */
async function clearCache(id = null) {
  const [orderKeys, unpayOrderKeys] = await Promise.all([
    getKeysByPattern(`orders:${order.userId}:*`),
    getKeysByPattern(`unpay-orders:${order.userId}:*`),
  ]);

  if (orderKeys.length !== 0 || unpayOrderKeys.length !== 0) {
    await delKey([...orderKeys, ...unpayOrderKeys]);
  }

  // 如果传递了id，则通过id清除订单详情缓存
  if (id) {
    // 如果是数组，则遍历
    const keys = Array.isArray(id)
      ? id.map((item) => `order:${item}`)
      : `order:${id}`;
    await delKey(keys);
  }
}

function bindGoodInfoWithOrder(arr) {
  return arr.map(async (o) => {
    let categoryKey = `category:${o.categoryId}`;
    let goodKey = `good:${o.goodId}`;
    let [category, good] = await Promise.all([
      getKey(categoryKey),
      getKey(goodKey),
    ]);
    if (!category) {
      category = await Category.findByPk(o.categoryId);
      if (!category) {
        setKey(categoryKey, { msg: "not found" });
        throw new NotFound("分类不存在！");
      }
      setKey(categoryKey, category);
    } else if (category.msg === "not found") throw new NotFound("分类不存在！");
    if (!good) {
      good = await Good.findByPk(o.goodId);
      if (!good) {
        setKey(categoryKey, { msg: "not found" });
        throw new NotFound("商品不存在！");
      }
      const previewUrl = JSON.parse(good.dataValues.previewUrl).map((i) => {
        return `http://${process.env.CDN_DOMAIN}/${i}`;
      });
      good = { ...good.dataValues, previewUrl };
      setKey(goodKey, good);
    } else if (good.msg === "not found") throw new NotFound("商品不存在！");
    let { typeId, sizeId } = category;
    let type, size;
    if (typeId) {
      let typeKey = `type:${typeId}`;
      type = await getKey(typeKey);
      if (!type) {
        type = await Type.findByPk(typeId);
        if (!type) {
          setKey(typeKey, { msg: "not found" });
          throw new NotFound("类型不存在！");
        }
        setKey(typeKey, type);
      } else if (type.msg === "not found") throw new NotFound("类型不存在！");
    }
    if (sizeId) {
      let sizeKey = `size:${sizeId}`;
      size = await getKey(sizeKey);
      if (!size) {
        size = await Size.findByPk(sizeId);
        if (!size) {
          setKey(sizeKey, { msg: "not found" });
          throw new NotFound("类型不存在！");
        }
        setKey(sizeKey, size);
      } else if (size.msg === "not found") throw new NotFound("类型不存在！");
    }
    return {
      ...o.dataValues,
      name: good.name,
      previewUrl: good.previewUrl[0],
      type: type?.name || null,
      size: size?.name || null,
      price: Number(category.price),
      shop: good.shop,
    };
  });
}

/**
 * 获取订单列表
 * GET /orders
 */
router.get("/", async function (req, res, next) {
  try {
    const { userId } = req;
    // cacheKey不要加用户id，会导致缓存命中率下降
    const currentPage = Math.abs(req.query.currentPage) || 1;
    const pageSize = Math.abs(req.query.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;
    const cacheKey = `orders:${userId}:${currentPage}:${pageSize}`;
    let countAndOrders = await getKey(cacheKey);
    let count, orders;
    if (countAndOrders) {
      count = countAndOrders.count;
      orders = countAndOrders.orders;
    }
    if (!orders) {
      const result = await Order.findAndCountAll({
        order: [["id", "DESC"]],
        attributes: { exclude: ["id"] },
        where: {
          userId,
        },
        limit: pageSize,
        offset,
      });
      count = result.count;
      orders = await Promise.all(bindGoodInfoWithOrder(result.rows));
      setKey(cacheKey, { orders, count });
    }
    success(res, "获取订单成功", {
      orders,
      total: count,
      currentPage,
      pageSize,
    });
  } catch (e) {
    failure(res, e, "获取订单失败");
  }
});

/**
 * 获取未支付订单列表
 * GET /orders/unpay
 */
router.get("/unpay", async function (req, res, next) {
  try {
    const { userId } = req;
    // cacheKey不要加用户id，会导致缓存命中率下降
    const currentPage = Math.abs(req.query.currentPage) || 1;
    const pageSize = Math.abs(req.query.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;
    const cacheKey = `unpay-orders:${userId}:${currentPage}:${pageSize}`;
    let countAndOrders = await getKey(cacheKey);
    let count, orders;
    if (countAndOrders) {
      count = countAndOrders.count;
      orders = countAndOrders.orders;
    }
    if (!orders) {
      const result = await Order.findAndCountAll({
        order: [["id", "DESC"]],
        attributes: { exclude: ["id"] },
        where: {
          userId,
          status: 0,
        },
        limit: pageSize,
        offset,
      });
      count = result.count;
      orders = await Promise.all(bindGoodInfoWithOrder(result.rows));
      setKey(cacheKey, { orders, count });
    }
    success(res, "获取订单成功", {
      orders,
      total: count,
      currentPage,
      pageSize,
    });
  } catch (e) {
    failure(res, e, "获取订单失败");
  }
});

/**
 * 新增订单
 * POST /orders
 */
router.post("/", async function (req, res, next) {
  let t;
  try {
    let body = filterBody(req);
    // 秒杀开始前需要将地址和分类都预热到缓存，尽量不查数据库
    const addressKey = `address:${body.addressId}`;
    const categoryKey = `category:${body.categoryId}`;
    let address = await getKey(addressKey);
    if (!address) {
      // 未命中缓存
      address = await Address.findByPk(body.addressId);
      if (!address) {
        setKey(addressKey, { msg: "not found" });
        throw new NotFound("地址不存在！");
      }
      setKey(addressKey, address);
      if (address.dataValues.userId !== Number(body.userId))
        throw new BadRequest("地址id与用户id不匹配！");
    } else if (address.msg === "地址不存在") {
      throw new NotFound("地址不存在！");
    } else if (address.userId !== Number(body.userId)) {
      throw new BadRequest("地址id与用户id不匹配！");
    }
    // 分类相关
    let category = await getKey(categoryKey);
    if (!category) {
      category = await Category.findByPk(body.categoryId);
      if (!category) {
        // 特殊处理，分类不存在也放入缓存，避免大量请求访问不存在的分类
        setKey(categoryKey, { msg: "not found" });
        throw new NotFound("分类不存在！");
      } else if (category.dataValues.goodId !== Number(body.goodId)) {
        // 特殊处理，分类和商品id不匹配也放入缓存，毕竟分类查询的是正确的
        // 不能提取到外层写，因为如果不是异常情况，需要缓存的是扣库存后的结果
        setKey(categoryKey, category);
        throw new BadRequest("分类id与商品id不匹配！");
      } else if (category.dataValues.inventory <= 0) {
        setKey(categoryKey, category);
        throw new NotFound("库存不足！");
      }
    } else if (category.msg === "not found") {
      throw new NotFound("分类不存在！");
    } else if (category.goodId !== Number(body.goodId))
      throw new BadRequest("分类id与商品id不匹配！");
    else if (category.inventory <= 0) throw new NotFound("库存不足!");

    // 库存足够，创建订单
    // 库存不能同时操作加减，需要开启事务
    t = await sequelize.transaction();
    // 为了确保读到的库存一定是最新数据，保证后续减库存正确，这里需要从数据库再读一次数据
    // 因为能竞争到锁的是少数，所以数据库读取量不会很大
    category = await Category.findByPk(body.categoryId, {
      transaction: t,
      lock: true,
    });
    category = await category.update(
      {
        inventory: (category.inventory || category.dataValues.inventory) - 1,
      },
      {
        where: {
          id: body.categoryId,
        },
        transaction: t,
        // 使用排他锁
      }
    );
    body = {
      orderid: uuidv4().replace(/-/g, ""),
      ...body,
      orderTime: new Date(),
      status: 0,
    };
    order = await Order.create(body, {
      transaction: t,
      lock: true,
    });
    // 删除订单列表缓存
    clearCache();
    await setKey(`order:${order.orderid}`, order);
    delete order.dataValues.id;
    await setKey(categoryKey, category);
    // 如果单类库存为0， 那么整体的库存就有可能为0
    if (category.inventory === 0) delKey(`allStockout:${order.goodId}`);
    // 这三个都涉及了库存内容，都要删掉
    delKey(`types:${order.goodId}`);
    delKey(`sizes:${order.goodId}`);
    delKey(`categories:${order.goodId}`);
    // 创建延迟队列，15分钟后自动取消订单
    delayOrderProducer(order.orderid, 15 * 60 * 1000);
    await t.commit();
    success(res, "创建订单成功", {
      order,
    });
  } catch (e) {
    if (t) await t.rollback();
    failure(res, e, "创建订单失败");
  }
});

/**
 * 支付订单
 * PUT /orders/pay/:orderid
 */
router.put("/pay/:orderid", async function (req, res, next) {
  let t;
  try {
    t = await sequelize.transaction();
    const { orderid } = req.params;
    const orderKey = `order:${orderid}`;
    let order = await getKey(orderKey);
    if (!order) {
      order = await Order.findOne({
        where: { orderid },
      });
      if (!order) {
        // 特殊处理
        setKey(orderKey, { msg: "not found" });
        throw new NotFound("订单不存在！");
      }
      setKey(orderKey, order);
      if (order.dataValues.userId !== req.userId)
        throw new BadRequest("订单id和用户id不匹配！");
      else if (order.dataValues.status === 1)
        throw new BadRequest("订单已支付！");
      else if (order.dataValues.status === 2)
        throw new BadRequest("订单已超时取消！");
    } else if (order.msg === "not found") throw new NotFound("订单不存在！");
    else if (order.userId !== req.userId) {
      throw new BadRequest("订单id和用户id不匹配！");
    } else if (order.status === 1) throw new BadRequest("订单已支付！");
    else if (order.status === 2) throw new BadRequest("订单已超时取消！");
    order = await Order.findOne({
      where: { orderid },
      transaction: t,
      lock: true,
    });
    order = await order.update(
      {
        paymentTime: new Date(),
        status: 1,
      },
      {
        transaction: t,
        lock: true,
      }
    );
    delete order.dataValues.id;
    setKey(orderKey, order);
    // 删除订单列表缓存
    clearCache();
    t.commit();
    success(res, "支付成功", { order });
  } catch (e) {
    // 排除超时取消的情况
    if (!t.finished) t.rollback();
    failure(res, e, "支付失败");
  }
});

/**
 * 获取单个订单
 * GET /orders/:orderid
 */
router.get("/:orderid", async function (req, res, next) {
  try {
    const { orderid } = req.params;
    // cacheKey不要加用户id，会导致缓存命中率下降
    const cacheKey = `order:${orderid}`;
    let order = await getKey(cacheKey);
    if (!order) {
      order = await Order.findOne({
        where: { orderid },
      });
      if (!order) {
        // 特殊处理
        setKey(cacheKey, { msg: "not found" });
        throw new NotFound("订单不存在！");
      }
      setKey(cacheKey, order);
      if (order.dataValues.userId !== req.userId)
        throw new BadRequest("订单id和用户id不匹配！");
      delete order.dataValues.id;
    } else if (order.msg === "not found") throw new NotFound("订单不存在！");
    else if (order.userId !== req.userId) {
      throw new BadRequest("订单id和用户id不匹配！");
    } else delete order.id;
    setKey(cacheKey, order);
    success(res, "获取订单成功", { order });
  } catch (e) {
    failure(res, e, "获取订单失败");
  }
});

module.exports = router;
