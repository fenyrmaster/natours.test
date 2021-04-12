const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require("../controllers/authController");
const reviewsRouter = require('../routes/reviewRoutes');

const tourRouter = express.Router();

// tourRouter.param('id', tourController.checkID);
tourRouter.use("/:tourId/reviews", reviewsRouter);

tourRouter.route("/top-5-cheap").get(tourController.aliasTop, tourController.getData);
tourRouter.route("/tour-stats").get(tourController.getStats);
tourRouter.route("/tour-plan/:year").get(authController.protect, authController.restrict("admin", "lead-guide") ,tourController.getMonthlyPlan);
tourRouter.route("/distances/:latlng/unit/:unit").get(tourController.getDistances)

tourRouter
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getTourWithin)

tourRouter
  .route('/')
  .get(tourController.getData)
  .post(authController.protect, authController.restrict("admin", "lead-guide","guide"), tourController.addData);
tourRouter
  .route('/:id')
  .get(tourController.getOneData)
  .patch(authController.protect, authController.restrict("admin", "lead-guide"), tourController.uploadTourImages, tourController.resizeTourImages, tourController.modifyData)
  .delete(authController.protect,authController.restrict("admin", "lead-guide") ,tourController.removeData);

module.exports = tourRouter;
