const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController")

const viewRouter = express.Router();

viewRouter.get("/",bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOveview);
viewRouter.get("/tour/:slug",authController.isLoggedIn, viewsController.getTour);
viewRouter.get("/login", authController.isLoggedIn, viewsController.login);
viewRouter.get("/signup", authController.isLoggedIn, viewsController.signup);
viewRouter.get("/me/settings", authController.protect, viewsController.accountSet);
viewRouter.get("/me/reviews", authController.protect, viewsController.accountRev);
viewRouter.get("/my-bookings", authController.protect, viewsController.getMyBookings);
viewRouter.get("/me/manageTours", authController.protect, authController.restrict("admin"), viewsController.tourManage);
viewRouter.get("/me/confirm/:token",  authController.isLoggedIn, viewsController.confirmUser);
//viewRouter.post("/submit-user-data", authController.protect, viewsController.updateUserData)

module.exports = viewRouter