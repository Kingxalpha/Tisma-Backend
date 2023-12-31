const express = require("express");
const bodyParser = require('body-parser');
const multer= require("multer")
const upload = multer({ dest: "uploads/" });
const { signUp, login, resetPassword, logOut, updatePassword } = require("../controller/auth");
const contactForm = require("../controller/contact");
const { addProduct, getProduct, updateProduct, deleteProduct, businessProfile } = require("../controller/controller");
const {follow, unfollow } = require("../controller/follow");
const { createBusiness, getBusiness, updateBusiness, deleteBusiness } = require("../controller/business");
const validateToken = require("../verifytoken");
const logoutMiddleware = require('../controller/auth');
const auth = require('../verifytoken');
// const authenticateJWT = require('../passport');
const dashboardData = require("../utils/dashboardData");
const { UserProfile } = require("../controller/profile");
const { createMessage, getMessage, msgRead } = require("../controller/messageForm");



const router = express.Router();

router.route("/profile/:email").get(UserProfile)
router.route("/dashboard").post(dashboardData)
router.route("/contact").post( contactForm);
router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/reset-password").post(auth, resetPassword);
router.route("/logout").post(logOut);
router.route("/updatepassword").patch(auth, updatePassword);
router.route("/follow/:userId").patch(follow);
router.route("unfollow/:userId").patch(unfollow);
router.route("/upload/product").post(upload.single('image'), addProduct)
router.route("/product").get(getProduct)
router.route("/product/:id").delete(deleteProduct)
router.route("/product/:id").patch(updateProduct)
router.route("/createbusiness").post(createBusiness);
router.route("/getbusiness/:businessId").get(getBusiness);
router.route("/updatebusiness/:businessId").put(updateBusiness);
router.route("/deletebusiness/:businessId").delete(deleteBusiness);
router.route("/createmessage").post(createMessage);
router.route("/getmessage").get( auth, getMessage);
router.route("/message/:messageId/read").put(msgRead);
router.route("/business-profile").post(businessProfile)




module.exports = router;