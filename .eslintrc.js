module.exports = {
  root: true,
  extends: ["@react-native", "plugin:prettier/recommended"],
  rules: {
    semi: [2, "always"], //语句强制分号结尾
    "block-spacing": [2, "always"],
    "jsx-quotes": [2, "prefer-single"],
  },
};
