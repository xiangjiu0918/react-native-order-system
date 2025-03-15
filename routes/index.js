var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  let result = 0;
  for (let i = 0; i < 1e6; i++) {
    result += i;
  }
  console.log(process.pid);
  res.send(`Hello from Worker ${process.pid}`);
});

module.exports = router;
