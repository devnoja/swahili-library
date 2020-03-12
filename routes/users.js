var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("To be implemented for handling users ....");
});

module.exports = router;
