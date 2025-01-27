const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Address } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFound } = require('http-errors');
const userAuth = require('../middlewares/user-auth');
const { delKey, getKey, setKey, getKeysByPattern } = require('../utils/redis');
const { Op } = require('sequelize');

/**
 * 过滤输入
 * @returns {Object}
 */
function filterBody(req) {
  return {
    userId: req.userId,
    name: req.body.name,
    tel: req.body.tel,
    district: req.body.district,
    detail: req.body.detail,
    default: req.body.default,
  };
}

/**
 * 清除缓存
 * @returns {Promise<void>}
 */
async function clearCache(id = null) {
  // 清除所有文章列表缓存
  const keys = await getKeysByPattern('addresses:*');

  if (keys.length !== 0) {
    await delKey(keys);
  }

  // 如果传递了id，则通过id清除文章详情缓存
  if (id) {
    // 如果是数组，则遍历
    const keys = Array.isArray(id) ? id.map(item => `address:${item}`) : `address:${id}`;
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

/**
 * 获取行政区划信息
 * GET /addresses/district/list
 */
router.get('/district/list', userAuth, async function (req, res) {
  try {
    // 先从缓存中取区划列表
    const cacheKey = 'district:list';
    let list = await getKey(cacheKey);
    if (list) {
      return success(res, '获取区划列表成功', { list });
    }
    const response = await axios.get('https://apis.map.qq.com/ws/district/v1/list', {
      params: {
        key: 'U3MBZ-EXWCT-2L2X2-VDRMF-WRVH2-QXF3M',
        struct_type: 1,
      },
    })
    //设置缓存7天失效
    await setKey(cacheKey, response.data?.result, 7 * 24 * 60 * 60);
    success(res, '获取行政区划列表成功', { list: response.data?.result });
  } catch (e) {
    failure(res, e);
  }
})

/**
 * 新增收货地址
 * POST /addresses
 */
router.post('/', userAuth, async function (req, res) {
  try {
    const body = filterBody(req);
    const address = await Address.create(body);
    await clearCache();
    success(res, '创建收货地址成功', { address }, 201);
  } catch (e) {
    failure(res, e, "创建收货地址失败");
  }
})

/**
 * 删除收货地址
 * DELETE /addresses/:id
 */
router.delete('/:id', userAuth, async function (req, res) {
  try {
    await Address.destroy({ where: { id: req.params.id } });
    await clearCache(req.params.id);
    success(res, '删除收货地址成功。');
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 修改收货地址
 * PUT /addresses/:id
 */
router.put('/:id', userAuth, async function (req, res, next) {
  try {
    const address = await findAddress(req.params.id);
    const body = filterBody(req);
    await address.update(body);
    await clearCache(address.id);
    success(res, "修改地址成功");
  } catch (e) {
    failure(res, e, "修改地址失败");
  };
});

/**
 * 查询收货地址列表
 * GET /addresses
 */
router.get('/', userAuth, async function (req, res, next) {
  try {
    const currentPage = Math.abs(req.query.currentPage) || 1;
    const pageSize = Math.abs(req.query.pageSize) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 定义带有「当前页码」和「每页条数」的 cacheKey 作为缓存的键
    const cacheKey = `addresses:${currentPage}:${pageSize}`;
    let data = await getKey(cacheKey);
    if (data) {
      return success(res, '查询地址列表成功。', data);
    }

    const condition = {
      order: [['id', 'ASC']],
      limit: pageSize,
      offset,
      where: {
        userId: {
          [Op.eq]: req.userId
        }
      },
    };
    const { count, rows } = await Address.findAndCountAll(condition);
    data = {
      addresses: rows,
      total: count,
      currentPage,
      pageSize,
    };
    await setKey(cacheKey, data);
    success(res, "查询地址列表成功", data);
  } catch (e) {
    failure(res, e, "查询地址列表失败");
  }
})

/**
 * 查询单个收货地址
 * GET /addresses/:id
 */
router.get('/:id', userAuth, async function(req, res, next) {
  try {
    const { id } = req.params;

    let address = await getKey(`address:${id}`);
    if (!address) {
      address = await Address.findByPk(id);
      if (!address) {
        throw new NotFound(`ID: ${ id }的文章未找到。`)
      }
      await setKey(`address:${id}`, address)
    }
    success(res, "查询收货地址成功", { address });
  } catch (e) {
    failure(res, e, "查询收货地址失败");
  }
})

module.exports = router;
