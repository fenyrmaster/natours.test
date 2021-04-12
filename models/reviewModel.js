const mongoose = require("mongoose");
const validator = require("validator");
const Tour = require("./tourModel");
const uniqueValidator = require('mongoose-unique-validator');

const reviewModel = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "a review must have text to let anyone know what do you think"],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, "you have to put a rating, so you can let anyone know if you liked the tour or not"],
        max: 5,
        min: 1
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "A review must have a user"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "A review must be about a tour, you know"]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewModel.index({tour: 1, user: 1}, {unique: true});

reviewModel.pre(/^find/, function(next){
    this.populate({
        path:"user",
        select: "name photo"
    });
    next();
});

reviewModel.statics.calcAveRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: {$avg: "$rating"}
            }
        }
    ]);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {ratingsAverage: stats[0].avgRating, ratingsQuantity: stats[0].nRating })
    } else{
        await Tour.findByIdAndUpdate(tourId, {ratingsAverage: 4.5, ratingsQuantity: 0 })
    }
}

reviewModel.post("save", function() {
    this.constructor.calcAveRatings(this.tour);
});

reviewModel.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
});

reviewModel.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAveRatings(this.r.tour)
});

reviewModel.plugin(uniqueValidator, {message: "You alredy created a review about this tour"})

const Review = mongoose.model("Review", reviewModel);
module.exports = Review;