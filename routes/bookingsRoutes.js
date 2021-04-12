const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require("../controllers/authController");

const bookingRouter = express.Router();

bookingRouter.get("/checkout-session/:tourID", authController.protect, bookingController.getCheckoutSe)
bookingRouter.get("/", authController.protect, authController.restrict("admin"), bookingController.getAllBookings);
bookingRouter.post("/", authController.protect, authController.restrict("admin"), bookingController.createBooking);
bookingRouter.route("/:id")
    .get(authController.protect, authController.restrict("admin"), bookingController.getBooking)
    .patch(authController.protect, authController.restrict("admin"), bookingController.updateBooking)
    .delete(authController.protect, authController.restrict("admin"), bookingController.removeBooking);

module.exports = bookingRouter;