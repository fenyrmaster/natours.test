const fs = require('fs');
const Tour = require("../models/tourModel");
const APIfeatures = require("../utils/APIFeatures");
const ApiErrors = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("../controllers/handlerFactory");
const multer = require("multer");
const sharp = require("sharp");

//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")){
        cb(null, true)
    } else {
        cb(new ApiErrors("Not a image, please upload an actual image", 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req,res,next) => {
    if(!req.files.imageCover || !req.files.images) return next();
    const imageCoverFile = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({quality: 90}).toFile(`public/img/tours/${imageCoverFile}`);
    req.body.imageCover = imageCoverFile;
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${index+1}.jpeg`;
        await sharp(req.files.images[index].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({quality: 90}).toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }))
    next();
})

exports.aliasTop = (req,res,next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
}

exports.getData = factory.getAll(Tour);
exports.getOneData = factory.getOne(Tour, { path: "reviews" });
exports.modifyData = factory.updateData(Tour);
exports.removeData = factory.deleteOne(Tour);

exports.addData = catchAsync(async (req,res,next) => {
    // const newid = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({id: newid}, req.body);
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "success",
    //         data: {
    //             tour: newTour
    //         }
    //     })
    // });
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    }
);

exports.getStats = catchAsync(async (req,res,next) => {
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    _id: "$difficulty",
                    numTours: {$sum: 1},
                    numRatings: {$sum: "$ratingsQuantity"},
                    avgRating: {$avg: "$ratingsAverage"},
                    avgPrice: {$avg: "$price"},
                    minPrice: {$min: "$price"},
                    maxPrice: {$max: "$price"},
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ])
        res.status(200).json({
            status: "success",
            data: {
                stats
            }
        })
})

exports.getMonthlyPlan = catchAsync(async (req,res, next) => {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$startDates" },
                    numToursStart: { $sum: 1 },
                    tours: { $push: "$name"}
                }
            },
            {
                $addFields: { month: "$_id" }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numToursStart: -1 }
            }
        ]);
        res.status(200).json({
            status: "success",
            data: {
                plan
            }
        })
});

exports.getTourWithin = catchAsync(async (req,res,next) => {
    // distance, latlng: 34.111745,-118.113491,unit
    const { distance, latlng, unit } = req.params;
    const [lat,lng] = latlng.split(",");

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng){
        next(new ApiErrors("THE LATITUDE OR THE LONGITUDE ARENT DEFINED, PLEASE DEFINE THEM", 400))
    }
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng,lat], radius] } } });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req,res,next) => {
    const { latlng, unit } = req.params;
    const [lat,lng] = latlng.split(",");

    const multiplier = unit === "mi" ? 0.000621371 : 0.001

    if(!lat || !lng){
        next(new ApiErrors("THE LATITUDE OR THE LONGITUDE ARENT DEFINED, PLEASE DEFINE THEM", 400))
    }

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1,lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            },
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            data: distance
        }
    })
})