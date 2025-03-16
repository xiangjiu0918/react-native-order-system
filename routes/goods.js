const express = require("express");
const router = express.Router();
const axios = require("axios");
const Sequelize = require("sequelize");
const { Good, Category, Type, Size, sequelize } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound } = require("http-errors");
const userAuth = require("../middlewares/user-auth");
const { delKey, getKey, setKey, getKeysByPattern } = require("../utils/redis");
const { Op } = require("sequelize");

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
    const goodKey = `good:${id}`;
    const typesKey = `types:${id}`;
    const sizesKey = `sizes:${id}`;
    const categoriesKey = `categories:${id}`;
    const minPriceKey = `minPrice:${id}`;
    const allStockoutKey = `allStockout:${id}`;
    let [good, types, sizes, categories, minPrice, allStockout] =
      await Promise.all([
        getKey(goodKey),
        getKey(typesKey),
        getKey(sizesKey),
        getKey(categoriesKey),
        getKey(minPriceKey),
        getKey(allStockoutKey),
      ]);
    if (!good) {
      good = await Good.findByPk(id);
      if (!good) {
        setKey(goodKey, { msg: "not found" });
        throw new NotFound("商品不存在！");
      }
      const previewUrl = JSON.parse(good.dataValues.previewUrl).map((i) => {
        return `http://${process.env.CDN_DOMAIN}/${i}`;
      });
      good = { ...good.dataValues, previewUrl };
      setKey(goodKey, good);
    } else if (good.msg === "not found") throw new NotFound("商品不存在！");
    if (!types || !sizes || !categories || !minPrice) {
      const result = await Promise.all([
        Type.findAll({
          attributes: ["id", "name", "thumbnailUrl"],
          where: { goodId: id },
        }),
        Size.findAll({
          attributes: ["id", "name"],
          where: { goodId: id },
        }),
      ]);
      types = result[0];
      sizes = result[1];
      categories = {};
      let transTypes = [];
      let transSizes = [];
      minPrice = Infinity; // 商品默认展示最低价格
      if (types.length > 0) {
        await Promise.all(
          types.map(async (t, index) => {
            // 缓存type
            await setKey(`type:${t.id}`, t);
            const r = await Category.findOne({
              attributes: [
                [Sequelize.fn("SUM", Sequelize.col("inventory")), "inventory"],
              ],
              group: ["typeId"],
              where: { typeId: t.dataValues.id },
            });
            transTypes.push({
              ...t.dataValues,
              thumbnailUrl: `http://${process.env.CDN_DOMAIN}/${t.dataValues.thumbnailUrl}`,
              stockout: r?.dataValues.inventory <= 0 ? true : false,
            });
            if (sizes.length > 0) {
              await Promise.all(
                sizes.map(async (s) => {
                  // 缓存size
                  await setKey(`size:${s.id}`, s);
                  let c;
                  if (index === 0) {
                    const arr = await Promise.all([
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
                        where: {
                          typeId: t.dataValues.id,
                          sizeId: s.dataValues.id,
                        },
                      }),
                    ]);
                    c = arr[1];
                    transSizes.push({
                      ...s.dataValues,
                      stockout:
                        arr[0]?.dataValues.inventory <= 0 ? true : false,
                    });
                  } else {
                    c = await Category.findOne({
                      where: {
                        typeId: t.dataValues.id,
                        sizeId: s.dataValues.id,
                      },
                    });
                  }
                  await setKey(`category:${c.id}`, c);
                  categories[`${t.dataValues.id}:${s.dataValues.id}`] = {
                    id: c.dataValues.id,
                    inventory: c.dataValues.inventory,
                    price: Number(c.dataValues.price),
                  };
                  minPrice = Math.min(Number(c.dataValues.price), minPrice);
                  return;
                })
              );
            } else {
              const c = await Category.findOne({
                where: {
                  typeId: t.dataValues.id,
                  sizeId: null,
                },
              });
              await setKey(`category:${c.id}`, c);
              categories[`${t.dataValues.id}:-1`] = {
                id: c.dataValues.id,
                inventory: c.dataValues.inventory,
                price: Number(c.dataValues.price),
              };
              minPrice = Math.min(Number(c.dataValues.price), minPrice);
              return;
            }
          })
        );
      } else {
        if (sizes.length > 0) {
          await Promise.all(
            sizes.map(async (s) => {
              // 缓存size
              await setKey(`size:${s.id}`, s);
              let c;
              const arr = await Promise.all([
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
                  where: {
                    typeId: null,
                    sizeId: s.dataValues.id,
                  },
                }),
              ]);
              c = arr[1];
              await setKey(`category:${c.id}`, c);
              transSizes.push({
                ...s.dataValues,
                stockout: arr[0]?.dataValues.inventory <= 0 ? true : false,
              });
              categories[`-1:${s.dataValues.id}`] = {
                id: c.dataValues.id,
                inventory: c.dataValues.inventory,
                price: Number(c.dataValues.price),
              };
              minPrice = Math.min(Number(c.dataValues.price), minPrice);
            })
          );
        } else {
          const c = await Category.findOne({
            where: {
              goodId: id,
            },
          });
          await setKey(`category:${c.id}`, c);
          categories["-1:-1"] = {
            id: c.dataValues.id,
            inventory: c.dataValues.inventory,
            price: Number(c.dataValues.price),
          };
          minPrice = Math.min(Number(c.dataValues.price), minPrice);
        }
      }
      types = transTypes.sort((a, b) => a.id - b.id);
      sizes = transSizes.sort((a, b) => a.id - b.id);
      setKey(typesKey, types);
      setKey(sizesKey, sizes);
      setKey(categoriesKey, categories);
      setKey(minPriceKey, minPrice);
    }
    if (allStockout === null) {
      const { inventory } = await Category.findOne({
        attributes: [
          [sequelize.fn("SUM", sequelize.col("inventory")), "inventory"],
        ],
        where: {
          goodId: id,
        },
      });
      allStockout = Number(inventory) <= 0;
      setKey(allStockoutKey, allStockout);
    }
    // 查询
    goodWithCatgory = {
      good: {
        ...good,
        price: minPrice,
        stockout: allStockout,
      },
      types,
      sizes,
      categories,
    };
    success(res, "查询商品成功", {
      ...goodWithCatgory,
    });
  } catch (e) {
    failure(res, e, "查询商品失败");
  }
});

module.exports = router;
