'use strict';
const {
  Model
} = require('sequelize');
const { BadRequest } = require('http-errors');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasMany(models.Address, { as: 'addresses' });
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: '该用户名已被占用' },
      validate: {
        notNull: { msg: '用户名必须填写。' },
        notEmpty: { msg: '用户名不能为空。' },
        len: { args: [2, 45], msg: '用户名长度必须在2 ~ 45之间。' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: '密码必须填写。' },
        notEmpty: { msg: '密码不能为空。' },
      },
      set(value) {
        if (value) {
          if (value.length >= 6 && value.length <= 45) {
            this.setDataValue('password', bcrypt.hashSync(value, 10));
          } else {
            throw new BadRequest('密码长度必须在6 ~ 45之间');
          }
        }
      }
    },
    avatar: DataTypes.TEXT,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: '该邮箱已被绑定' },
      set(value) {
        if (value.match(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/)) {
          this.setDataValue('email', value);
        } else {
          throw new BadRequest('邮箱只允许由只允许英文字母、数字、下划线、英文句号、@以及中划线组成');
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};