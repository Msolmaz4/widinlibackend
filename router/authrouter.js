

const router = require("express").Router();

const auth = require("../controller/auth");

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/logout", auth.logout);

router.post("/refresh", auth.refresh);
router.post("/forgot",auth.forgot);
router.post("/reset",auth.reset);



/* -------------------------------------------------------------------------- */
module.exports = router;
