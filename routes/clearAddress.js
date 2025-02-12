const express = require("express");
const router = express.Router();
const { delKey, getKeysByPattern } = require("../utils/redis");
const { success } = require("../utils/responses");

router.get("/", async function (req, res, next) {
  try {
    const keys = await getKeysByPattern("address:*");

    if (keys.length !== 0) {
      await delKey(keys);
    }
    success(res, "清空地址缓存成功");
  } catch (e) {
    failure(res, e, "清空地址缓存失败");
  }
});

module.exports = router;
