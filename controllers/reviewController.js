const ApiErrors = require("../utils/appError");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");
const { populate } = require("../models/reviewModel");

exports.createReview = catchAsync(async(req,res) => {
    const newReview = await Review.create({
        review: req.body.review,
        rating: req.body.rating,
        user: req.user._id,
        tour: req.params.tourId
    });
    res.status(201).json({
        status: "success",
        data: {
            newReview
        }
    })
});
exports.getReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReviews = factory.deleteOne(Review);
exports.updateReview = factory.updateData(Review);