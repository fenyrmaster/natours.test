const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require("../models/userModel");

const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "a tour must have a name"],
        unique: true,
        trim: true,
        maxlength: [40, "SHORTER NAME PLZ"],
        minlength: [10, "LONGER NAME PLZ"],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "A tour MUST have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour MUST have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour MUST have difficulty"],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty has to be easy, medium or difficult otherwise it doesnt make any sense"
    }
    },
    price: {
        type: Number,
        required: [true, "a tour must have a price"]
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "THIS TOUR SUCK"],
        max: [5, "THIS TOUR IS TOO AMAZING TO BE IN THE API"],
        set: val => Math.round(val * 10) / 10
    },
    priceDiscount: {
        type: Number,
        validate:{
            validator: function(val) {
                return val < this.price;
            },
            message: "What are you trying to do? with the price of ({VALUE}), let anyone have free access to this expensive course? you are so stupid, so im not letting you do that"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour MUST have a description"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour MUST have a cool image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        adress: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            adress: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

toursSchema.virtual("durationWeeks").get(function() {
    return this.duration/7;
});

toursSchema.index({price: 1, ratingsAverage: -1});
toursSchema.index({ startLocation: "2dsphere" })

toursSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})

toursSchema.pre("save", function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

toursSchema.pre(/^find/, function(next){
    this.populate({
        path:"guides",
        select: "name photo role"
    })
    next();
});

toursSchema.pre(/^find/, function(next) {
    this.populate({
        path: "reviews",
        select: "review user rating"
    })
    next();
})

toursSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true} });
    next();
});

//toursSchema.pre("save", async function() {
//    const guidesPromises = this.guides.map(async id =>  await User.findById(id));
//    this.guides = await Promise.all(guidesPromises);
//    next();
//})

//toursSchema.pre("aggregate", function(next) {
//    this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
//    next();
//})

const Tour = mongoose.model("Tour", toursSchema);

module.exports = Tour;