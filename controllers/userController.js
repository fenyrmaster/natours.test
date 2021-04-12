const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const ApiErrors = require("../utils/appError");
const multer = require("multer");
const factory = require("../controllers/handlerFactory");

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req,file,cb) => {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

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

const filterObj = (obj, ...allowedfields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el)){
            newObj[el] = obj[el];
        }
    })
    return newObj;
}

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPic = catchAsync(async (req,res,next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`);
    next();
})

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async(req,res,next) => {
    if(req.body.password || req.body.confirmPassword){
        return next(new ApiErrors("You arent suppouse to put a password here", 400));
    }
    const filter = filterObj(req.body, "name", "email");
    if(req.file) filter.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filter, {
        new: true, 
        runValidators: true
    });

    res.status(201).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: "success",
        data: null
    })
})

exports.createNewUser = (req,res) => {
    res.status(500).json({
        message: "its working, but you need to work on this one! Please use /signup instead",
    })
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateData(User);
exports.removeUser = factory.deleteOne(User);