const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const indexRouter = require("./routes/index");
const captchaRouter = require("./routes/captcha");
const usersRouter = require("./routes/users");
const addressesRouter = require("./routes/addresses");
const goodsRouter = require("./routes/goods");
const preselectRouter = require("./routes/preselect");
const userAuth = require("./middlewares/user-auth");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/captcha", captchaRouter);
app.use("/users", usersRouter);
app.use("/addresses", addressesRouter);
app.use("/goods", goodsRouter);
app.use("/preselects", userAuth, preselectRouter);

module.exports = app;
