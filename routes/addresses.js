const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Address } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound } = require("http-errors");
const userAuth = require("../middlewares/user-auth");
const { delKey, getKey, setKey, getKeysByPattern } = require("../utils/redis");
const { Op } = require("sequelize");

/**
 * 过滤输入
 * @returns {Object}
 */
function filterBody(req) {
  return {
    userId: req.userId,
    name: req.body.name,
    tel: req.body.tel,
    district: JSON.stringify(req.body.district),
    detail: req.body.detail,
    default: Boolean(req.body.default),
  };
}

/**
 * 清除缓存
 * @returns {Promise<void>}
 */
async function clearCache(userId, id = null) {
  // 清除所有地址列表缓存
  const keys = await getKeysByPattern(`addresses:${userId}:*`);

  if (keys.length !== 0) {
    await delKey(keys);
  }

  // 如果传递了id，则通过id清除地址详情缓存
  if (id) {
    // 如果是数组，则遍历
    const keys = Array.isArray(id)
      ? id.map((item) => `address:${userId}:${item}`)
      : `address:${userId}:${id}`;
    await delKey(keys);
  }
}

async function findAddress(id) {
  const address = await Address.findByPk(id);
  if (address) {
    return address;
  } else {
    throw new NotFound("地址不存在");
  }
}

async function removeOldDefault(userId) {
  // 修改旧的默认地址
  const defaultItem = await Address.findOne({
    where: { default: true },
  });
  if (defaultItem) {
    delKey(`address:${userId}:default`);
    defaultItem.update({ default: false });
  }
}

/**
 * 获取行政区划信息
 * GET /addresses/district/list
 */
router.get("/district/list", userAuth, async function (req, res) {
  try {
    // 先从缓存中取区划列表
    const cacheKey = "district:list";
    let list = await getKey(cacheKey);
    if (list) {
      return success(res, "获取区划列表成功", { list });
    }
    const response = await axios.get(
      "https://apis.map.qq.com/ws/district/v1/list",
      {
        params: {
          key: "U3MBZ-EXWCT-2L2X2-VDRMF-WRVH2-QXF3M",
          struct_type: 1,
        },
      }
    );
    //设置缓存7天失效
    await setKey(cacheKey, response.data?.result, 7 * 24 * 60 * 60);
    success(res, "获取行政区划列表成功", { list: response.data?.result });
  } catch (e) {
    failure(res, e);
  }
});

/**
 * 新增收货地址
 * POST /addresses
 */
router.post("/", userAuth, async function (req, res) {
  try {
    const body = filterBody(req);
    if (body.default === true) {
      removeOldDefault(req.userId);
    }
    const address = await Address.create(body);
    await clearCache(req.userId);
    success(res, "创建收货地址成功", { address }, 201);
  } catch (e) {
    console.log(e);
    failure(res, e, "创建收货地址失败");
  }
});

/**
 * 删除收货地址
 * DELETE /addresses/:id
 */
router.delete("/:id", userAuth, async function (req, res) {
  try {
    const address = await findAddress(req.params.id);
    if (address.dataValues.default === true)
      delKey(`address:${req.userId}:default`);
    await Address.destroy({ where: { id: req.params.id } });
    await clearCache(req.userId, req.params.id);
    success(res, "删除收货地址成功。");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 修改收货地址
 * PUT /addresses/:id
 */
router.put("/:id", userAuth, async function (req, res, next) {
  try {
    const address = await findAddress(req.params.id);
    const body = filterBody(req);
    if (body.default === true) {
      removeOldDefault(req.userId);
    }
    await address.update(body);
    await clearCache(req.userId, address.id);
    success(res, "修改地址成功");
  } catch (e) {
    failure(res, e, "修改地址失败");
  }
});

/**
 * 查询收货地址列表
 * GET /addresses
 */
router.get("/", userAuth, async function (req, res, next) {
  try {
    const currentPage = Math.abs(req.query.currentPage) || 1;
    const pageSize = Math.abs(req.query.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 定义带有「当前页码」和「每页条数」的 cacheKey 作为缓存的键
    const cacheKey = `addresses:${req.userId}:${currentPage}:${pageSize}`;
    let data = await getKey(cacheKey);
    if (data) {
      return success(res, "查询地址列表成功。", data);
    }

    const condition = {
      order: [["id", "ASC"]],
      limit: pageSize,
      offset,
      where: {
        userId: {
          [Op.eq]: req.userId,
        },
      },
    };
    const { count, rows } = await Address.findAndCountAll(condition);
    const addresses = rows.map((item) => {
      item.dataValues.district = JSON.parse(item.dataValues.district);
      return item;
    });

    const defaultItem = await Address.findOne({
      where: { default: true, userId: req.userId },
      attributes: ["id"],
    });
    data = {
      addresses,
      defaultId: defaultItem?.dataValues.id || null,
      total: count,
      currentPage,
      pageSize,
    };
    await setKey(cacheKey, data);
    success(res, "查询地址列表成功", data);
  } catch (e) {
    console.log("e", e);
    failure(res, e, "查询地址列表失败");
  }
});

/**
 * 获取默认收货地址
 * GET /addresses/default
 */
router.get("/default", userAuth, async function (req, res, next) {
  try {
    const cacheKey = `address:${req.userId}:default`;
    let address = await getKey(cacheKey);
    if (!address) {
      address = await Address.findOne({
        where: {
          userId: req.userId,
          default: true,
        },
      });
      if (address) {
        address.dataValues.district = JSON.parse(address.dataValues.district);
      } else {
        // 没有默认记录就返回第一条记录
        address = await Address.findOne({
          where: { userId: req.userId },
        });
        if (address) {
          address.dataValues.district = JSON.parse(address.dataValues.district);
        }
      }
      await setKey(cacheKey, address);
    }
    success(res, "查询收货地址成功", { address });
  } catch (e) {
    console.log("e", e);
    failure(res, e, "查询收货地址失败");
  }
});

/**
 * 查询单个收货地址
 * GET /addresses/:id
 */
router.get("/:id", userAuth, async function (req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `address:${req.userId}:${id}`;
    let address = await getKey(cacheKey);
    if (!address) {
      address = await Address.findByPk(id);
      if (address) {
        address.dataValues.district = JSON.parse(address.dataValues.district);
      } else {
        throw new NotFound(`ID: ${id}的收货地址未找到。`);
      }
      await setKey(cacheKey, address);
    }
    success(res, "查询收货地址成功", { address });
  } catch (e) {
    failure(res, e, "查询收货地址失败");
  }
});

module.exports = router;
