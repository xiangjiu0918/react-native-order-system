const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const { Preselect, Address, Category } = require("../models");
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
    goodId: req.body.goodId,
    categoryId: req.body.categoryId,
    addressId: req.body.addressId,
    num: req.body.num,
  };
}

/**
 * 新增/修改预选
 * POST /preselects
 */
router.post("/", async function (req, res, next) {
  try {
    const body = filterBody(req);
    // 需要保证地址id和用户id匹配
    const address = await Address.findByPk(body.addressId);
    if (!address) throw new NotFound("地址不存在！");
    else if (address.dataValues.userId === body.userId) {
      const category = await Category.findByPk(body.categoryId);
      if (!category) throw new NotFound("分类不存在！");
      else if (category.dataValues.goodId !== Number(body.goodId))
        throw new BadRequest("分类id与商品id不匹配！");
      let preselect = await Preselect.findOne({
        where: {
          userId: body.userId,
          goodId: body.goodId,
        },
      });
      if (!preselect) preselect = await Preselect.create(body);
      else preselect = await preselect.update(body);
      delKey(`preselect:${body.userId}:${body.goodId}`);
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
 * GET /preselects/:goodId
 */
router.get("/:goodId", async function (req, res, next) {
  try {
    const { goodId } = req.params;
    const cacheKey = `preselect:${req.userId}:${goodId}`;
    let preselect = await getKey(cacheKey);
    if (!preselect) {
      preselect = await Preselect.findOne({
        where: {
          userId: req.userId,
          goodId,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["typeId", "sizeId"],
          },
        ],
      });
      if (!preselect) {
        throw new NotFound(`goodId: ${goodId}的预选单未找到。`);
      } else if (preselect.userId !== req.userId) {
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
