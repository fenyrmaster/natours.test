const mongoose = require("mongoose");

const bookingModel = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "booking must belong to a tour, you know"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "booking must belong to a user, you know"]
    },
    price: {
        type: Number,
        required: [true, "Booking must have a price"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingModel.pre(/^find/, function(next){
    this.populate("user").populate({
        path: "tour"
    })
    next();
})

const Booking = mongoose.model("Booking", bookingModel);
module.exports = Booking