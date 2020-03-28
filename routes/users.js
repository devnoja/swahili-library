const express = require("express");
const router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("To be implemented for handling users ....");
});

module.exports = router;
