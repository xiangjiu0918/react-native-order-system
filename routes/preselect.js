const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const { Preselect, Address } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest } = require("http-errors");
const { delKey, getKey, setKey, getKeysByPattern } = require("../utils/redis");
const { Op } = require("sequelize");

/**
 * 过滤输入
 * @returns {Object}
 */
function filterBody(req) {
  return {
    userId: req.userId,
    categoryId: req.body.categoryId,
    addressId: req.body.addressId,
    num: req.body.num,
  };
}

/**
 * 新增预选
 * POST /preselects
 */
router.post("/", async function (req, res, next) {
  try {
    const body = filterBody(req);
    // 需要保证地址id和用户id匹配
    const address = await Address.findByPk(body.addressId);
    if (address?.dataValues?.userId === body.userId) {
      const preselect = await Preselect.create(body);
      success(res, "添加预选成功", {
        preselect,
      });
    } else {
      throw new BadRequest("地址id与用户id不匹配！");
    }
  } catch (e) {
    failure(res, e, "添加预选失败");
  }
});

/**
 * 修改预选
 * PUT /preselects/:id
 */
router.put("/:id", async function (req, res, next) {
  try {
    const body = filterBody(req);
    const { id } = req.params;
    // 需要保证地址id和用户id匹配
    const address = await Address.findByPk(body.addressId);
    if (address?.dataValues?.userId === body.userId) {
      let preselect = await Preselect.findByPk(id);
      if (!preselect) preselect = await Preselect.create(body);
      else preselect = await preselect.update(body);
      delKey(`preselect:${req.userId}:${id}`);
      success(res, "修改预选成功", {
        preselect,
      });
    } else {
      throw new BadRequest("地址id与用户id不匹配！");
    }
  } catch (e) {
    failure(res, e, "修改预选失败");
  }
});

/**
 * 获取预选
 * GET /preselects/:id
 */
router.get("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `preselect:${req.userId}:${id}`;
    let preselect = await getKey(cacheKey);
    if (!preselect) {
      preselect = await Preselect.findByPk(id);
      if (!preselect) {
        throw new NotFound(`ID: ${id}的预选单未找到。`);
      }
      if (preselect.userId !== req.userId) {
        throw new BadRequest("用户id和预选单id不匹配！");
      }
      await setKey(cacheKey, preselect);
    }
    success(res, "获取预选成功", { preselect });
  } catch (e) {
    failure(res, e, "获取预选失败");
  }
});

module.exports = router;
