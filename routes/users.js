var express = require("express");
const multiparty = require("multiparty");
var router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound, BadRequest, Unauthorized } = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const validateCaptcha = require("../middlewares/validate-captcha");
const userAuth = require("../middlewares/user-auth");
const { delKey } = require("../utils/redis");
const { avatarUpload } = require("../utils/aliyun");

function parse(req) {
  return new Promise((resolve, reject) => {
    let form = new multiparty.Form();
    form.parse(req, (err, fields, file) => {
      if (err) reject(err);
      resolve({ fields, file });
    });
  });
}

function uploadFile(req, res) {
  return new Promise((resolve, reject) => {
    avatarUpload(req, res, (err) => {
      if (err) reject(err);
      console.log("file", req.file);
      resolve();
    });
  });
}

/**
 * 用户注册
 * POST /users/sign_up
 */
router.post("/sign_up", validateCaptcha, async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      avatar: "uploads/defaultAvator.jpeg",
    };
    const user = await User.create(body);
    delete user.dataValues.password; // 删除密码
    // 请求成功，删除验证码，防止重复使用
    await delKey(req.body.captchaKey);
    // // 发送邮件
    // const msg = {
    //   to: user.email,
    //   subject: '「长乐未央」的注册成功通知',
    //   html: `
    //     您好，<span style="color: red">${user.nickname}</span>。<br><br>
    //     恭喜，您已成功注册会员！<br><br>
    //     请访问<a href="https://clwy.cn">「长乐未央」</a>官网，了解更多。<br><br>
    //     ━━━━━━━━━━━━━━━━<br>
    //     长乐未央
    //   `,
    // };
    // await mailProducer(msg);
    success(res, "创建用户成功。", { user }, 201);
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 测试用户注册
 * POST /users/sign_up
 */
router.post("/test_sign_up", async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      avatar: "uploads/defaultAvator.jpeg",
    };
    const user = await User.create(body);
    delete user.dataValues.password; // 删除密码
    success(res, "创建用户成功。", { user }, 201);
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 用户登录
 * POST /users/sign_in
 */
router.post("/sign_in", async function (req, res, next) {
  try {
    const { login, password } = req.body;

    if (!login) {
      throw new BadRequest("邮箱/用户名必须填写。");
    }

    if (!password) {
      throw new BadRequest("密码必须填写。");
    }

    const condition = {
      where: {
        [Op.or]: [{ email: login }, { name: login }],
      },
    };

    // 通过email或username，查询用户是否存在
    const user = await User.findOne(condition);
    if (!user) {
      throw new NotFound("用户不存在，无法登录。");
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new Unauthorized("密码错误。");
    }

    // 生成身份验证令牌
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    delete user.dataValues.password;
    success(res, "登录成功。", {
      token,
      user: {
        ...user.dataValues,
        avatar: `http://${process.env.CDN_DOMAIN}/${user.dataValues.avatar}`,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 上传用户头像
 * POST /users/avatar
 */
router.post("/avatar", userAuth, function (req, res) {
  try {
    // let form = new multiparty.Form();
    // form.parse(req, (err, fields, file) => {
    //   console.log("field", fields, "file", file);
    // });
    avatarUpload(req, res, async function (error) {
      try {
        if (error) {
          throw err;
        }
        if (!req.file) {
          throw new BadRequest("请选择要上传的文件");
        }
        const user = await User.findOne({ where: { id: req.userId } });
        await user.update({
          avatar: req.file.path + "/" + req.file.filename,
        });

        success(res, "上传成功。", {
          avatar: `http://${process.env.CDN_DOMAIN}/${req.file.path}/${req.file.filename}`,
        });
      } catch (e) {
        failure(res, e);
      }
    });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 获取用户信息
 * GET /users
 */
router.get("/", userAuth, async function (req, res) {
  const user = await User.findOne({ where: { id: req.userId } });
  user.dataValues.avatar = `http://${process.env.CDN_DOMAIN}/${user.dataValues.avatar}`;
  delete user.dataValues.password;
  success(res, "获取用户信息成功。", { user });
});

module.exports = router;
