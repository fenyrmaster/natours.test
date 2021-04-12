const express = require('express');

const reviewsController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const reviewsRouter = express.Router({mergeParams: true});

reviewsRouter.use(authController.protect);

reviewsRouter
    .route("/")
    .get(reviewsController.getReviews)
    .post(authController.restrict("user"), reviewsController.createReview)
    
reviewsRouter
    .route("/:id")
    .get(reviewsController.getReview)
    .delete(authController.restrict("user","admin") ,reviewsController.deleteReviews)
    .patch(authController.restrict("user", "admin"), reviewsController.updateReview)

module.exports = reviewsRouter