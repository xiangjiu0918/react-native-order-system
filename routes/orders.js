const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const { sequelize, Order, Address, Category } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest } = require("http-errors");
const { delKey, getKey, setKey, getKeysByPattern } = require("../utils/redis");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

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
      console.log("address.userid", address.userId, body.userId);
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
    });
    await setKey(`order:${order.orderid}`, order);
    delete order.dataValues.id;
    await setKey(categoryKey, category);
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
      else if (
        (Date.now() - order.dataValues.orderTime.getTime()) / (1000 * 60) >
        15
      ) {
        order = await order.update(
          {
            status: 2,
          },
          {
            transaction: t,
          }
        );
        // 回加库存
        const category = await Category.findByPk(order.dataValues.categoryId, {
          transaction: t,
        });
        await category.update(
          {
            inventory: category.dataValues.inventory + 1,
          },
          {
            transaction: t,
          }
        );
        setKey(`category:${order.dataValues.categoryId}`, category);
        setKey(orderKey, order);
        t.commit();
        throw new BadRequest("订单已超时取消！");
      }
    } else if (order.msg === "not found") throw new NotFound("订单不存在！");
    else if (order.userId !== req.userId) {
      throw new BadRequest("订单id和用户id不匹配！");
    } else if (order.status === 1) throw new BadRequest("订单已支付！");
    else if (order.status === 2) throw new BadRequest("订单已超时取消！");
    else if (
      (Date.now() - new Date(order.orderTime).getTime()) / (1000 * 60) >
      15
    ) {
      order = await Order.findOne({
        where: { orderid },
        transaction: t,
      });
      order = await order.update(
        {
          status: 2,
        },
        {
          transaction: t,
        }
      );
      // 回加库存
      const category = await Category.findByPk(order.categoryId, {
        transaction: t,
      });
      await category.update(
        {
          inventory: category.dataValues.inventory + 1,
        },
        {
          transaction: t,
        }
      );
      setKey(`category:${order.categoryId}`, category);
      setKey(orderKey, order);
      t.commit();
      throw new BadRequest("订单已超时取消！");
    }
    order = await Order.findOne({
      where: { orderid },
      transaction: t,
    });
    order = await order.update(
      {
        paymentTime: new Date(),
        status: 1,
      },
      {
        transaction: t,
      }
    );
    delete order.dataValues.id;
    setKey(orderKey, order);
    t.commit();
    success(res, "支付成功", { order });
  } catch (e) {
    // 排除超时取消的情况
    if (!t.finished) t.rollback();
    failure(res, e, "支付失败");
  }
});

/**
 * 获取订单
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
        where: {
          userId: req.userId,
          orderid,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["typeId", "sizeId"],
          },
        ],
      });
      if (!order) {
        throw new NotFound(`orderid: ${orderid}的订单未找到。`);
      } else if (order.dataValues.userId !== req.userId) {
        throw new BadRequest("用户id和订单id不匹配！");
      }
      await setKey(cacheKey, order);
    } else if (order.userId !== req.userId) {
      throw new BadRequest("用户id和订单id不匹配！");
    }
    success(res, "获取订单成功", { order });
  } catch (e) {
    failure(res, e, "获取订单失败");
  }
});

module.exports = router;
