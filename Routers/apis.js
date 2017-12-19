var express = require("express");
var router = express.Router();

router.use("/project", require("./Apis/Project.js"));
router.use("/account", require("./Apis/account.js"));

module.exports = router;