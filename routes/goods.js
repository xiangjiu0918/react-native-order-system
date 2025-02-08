const express = require("express");
const router = express.Router();
const axios = require("axios");
const Sequelize = require("sequelize");
const { Good, Category, Type, Size } = require("../models");
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
async function clearCache(id = null) {
  // 清除所有商品列表缓存
  const keys = await getKeysByPattern("goods:*");

  if (keys.length !== 0) {
    await delKey(keys);
  }

  // 如果传递了id，则通过id清除商品详情缓存
  if (id) {
    // 如果是数组，则遍历
    const keys = Array.isArray(id)
      ? id.map((item) => `good:${item}`)
      : `good:${id}`;
    await delKey(keys);
  }
}

async function findGood(id) {
  const good = await Good.findByPk(id);
  if (good) {
    return good;
  } else {
    throw new NotFound("商品不存在");
  }
}

/**
 * 查询商品列表
 * GET /goods
 */
router.get("/", async function (req, res, next) {
  try {
    const currentPage = Math.abs(req.query.currentPage) || 1;
    const pageSize = Math.abs(req.query.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 定义带有「当前页码」和「每页条数」的 cacheKey 作为缓存的键
    const cacheKey = `goods:${currentPage}:${pageSize}`;
    let data = await getKey(cacheKey);
    if (data) {
      return success(res, "查询商品列表成功。", data);
    }

    const condition = {
      attributes: [[Sequelize.fn("MIN", Sequelize.col("price")), "price"]], //计算最低价格作为显示价格
      group: ["goodId"],
      include: [
        {
          model: Good,
          as: "good",
          attributes: ["id", "name", "previewUrl", "sale"],
        },
      ],
      order: [["goodId", "ASC"]],
      limit: pageSize,
      offset,
    };
    const { count, rows } = await Category.findAndCountAll(condition);
    const goods = rows.map((item) => {
      const previewUrl = `http://${process.env.CDN_DOMAIN}/${
        JSON.parse(item.dataValues.good.dataValues.previewUrl)[0]
      }`;
      return {
        price: item.dataValues.price,
        ...item.dataValues.good.dataValues,
        previewUrl,
      };
    });

    data = {
      goods,
      total: count.length,
      currentPage,
      pageSize,
    };
    await setKey(cacheKey, data);
    success(res, "查询商品列表成功", data);
  } catch (e) {
    failure(res, e, "查询商品列表失败");
  }
});

/**
 * 查询单个商品
 * GET /goods/:id
 */
router.get("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    let goodWithCatgory = await getKey(`good:${id}`);
    if (!goodWithCatgory) {
      const [good, types, sizes] = await Promise.all([
        Good.findByPk(id, {
          attributes: { exclude: ["createdAt", "updatedAt"] },
        }),
        Type.findAll({
          attributes: ["id", "name", "thumbnailUrl"],
          where: { goodId: id },
        }),
        Size.findAll({
          attributes: ["id", "name"],
          where: { goodId: id },
        }),
      ]);
      if (!good) {
        throw new NotFound(`ID: ${id}的商品未找到。`);
      } else {
        const previewUrl = JSON.parse(good.dataValues.previewUrl).map((i) => {
          return `http://${process.env.CDN_DOMAIN}/${i}`;
        });
        console.log("types", types, "sizes", sizes);
        let categories = {};
        let transTypes = [];
        let transSizes = [];
        let price = Infinity; // 商品默认展示最低价格
        if (types.length > 0) {
          await Promise.all(
            types.map(async (t) => {
              const r = await Category.findOne({
                attributes: [
                  [
                    Sequelize.fn("SUM", Sequelize.col("inventory")),
                    "inventory",
                  ],
                ],
                group: ["typeId"],
                where: { typeId: t.dataValues.id },
              });
              console.log("r", r);
              transTypes.push({
                ...t.dataValues,
                thumbnailUrl: `http://${process.env.CDN_DOMAIN}/${t.dataValues.thumbnailUrl}`,
                stockout: r?.dataValues.inventory <= 0 ? true : false,
              });
              if (sizes.length > 0) {
                await Promise.all(
                  sizes.map(async (s) => {
                    const [r, c] = await Promise.all([
                      Category.findOne({
                        attributes: [
                          [
                            Sequelize.fn("SUM", Sequelize.col("inventory")),
                            "inventory",
                          ],
                        ],
                        group: ["sizeId"],
                        where: { sizeId: s.dataValues.id },
                      }),
                      Category.findOne({
                        attributes: ["inventory", "price"],
                        where: {
                          typeId: t.dataValues.id,
                          sizeId: s.dataValues.id,
                        },
                      }),
                    ]);
                    transSizes.push({
                      ...s.dataValues,
                      stockout: r?.dataValues.inventory <= 0 ? true : false,
                    });
                    categories[`${t.dataValues.id}:${s.dataValues.id}`] = {
                      inventory: c.dataValues.inventory,
                      price: Number(c.dataValues.price),
                    };
                    price = Math.min(Number(c.dataValues.price), price);
                    return;
                  })
                );
              } else {
                const c = await Category.findOne({
                  attributes: ["inventory", "price"],
                  where: {
                    typeId: t.dataValues.id,
                    sizeId: null,
                  },
                });
                categories[`${t.dataValues.id}:null`] = {
                  inventory: c.dataValues.inventory,
                  price: Number(c.dataValues.price),
                };
                price = Math.min(Number(c.dataValues.price), price);
                return;
              }
            })
          );
        } else {
          const c = await Category.findOne({
            attributes: ["inventory", "price"],
            where: {
              goodId: id,
            },
          });
          categories["null:null"] = {
            inventory: c.dataValues.inventory,
            price: Number(c.dataValues.price),
          };
          price = Math.min(Number(c.dataValues.price), price);
        }
        goodWithCatgory = {
          good: {
            ...good.dataValues,
            previewUrl,
            price,
          },
          types: transTypes,
          sizes: transSizes,
          categories,
        };
        await setKey(`good:${id}`, goodWithCatgory);
      }
    }
    success(res, "查询商品成功", {
      ...goodWithCatgory,
    });
  } catch (e) {
    failure(res, e, "查询商品失败");
  }
});

module.exports = router;
