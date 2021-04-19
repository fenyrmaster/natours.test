const User = require("../models/userModel");
const { promisify } = require("util");
const ApiErrors = require("../utils/appError");
const JWT = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const Email = require("./../utils/email");
const { emit } = require("process");

const points = {
    points: 5,
    duration: 15*60*1000,
    blockDuration: 15*60*1000
}

const signToken = id => {
    return JWT.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie("jwt", token, {
        maxAge: process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000,
        httpOnly: true,
        secure: req.secure || req.headers["x-fowarded-proto"] === "https"
    });
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);
    res.cookie("jwt", token, {
        maxAge: process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000,
        httpOnly: true,
        secure: req.secure || req.headers["x-fowarded-proto"] === "https"
    });
    const randomString = newUser.confirmUser();
    const confirmUrl = `${req.protocol}://${req.get("host")}/me/confirm/${randomString}`
    await newUser.save({validateBeforeSave: false});
    newUser.password = undefined;
    const url = `${req.protocol}://${req.get("host")}/me/settings`;
    await new Email(newUser, url).sendWelcome(confirmUrl);

//        await sendEmail({
//            email: newUser.email,
//            subject: "your password reset token (valid for 10 min)",
//            message: messageMail
//        });
//
    res.status(201).json({
        status: "success",
        token: token,
        message: "please confirm your password, we just send you an email.",
        data: {
            user: newUser
        }
    })
});

exports.confirmIdentity = catchAsync(async (req,res,next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({confirmString: hashedToken});
    if(!user) {
        return next(new ApiErrors("im sorry, but that token is not valid", 404));
    }
    if(user.confirmStringExpiration < Date.now()){
        await User.findByIdAndDelete(user.id);
        return next(new ApiErrors("im sorry, but your time is up, create a new user", 410));
    }
    user.confirmed = true;
    user.confirmString = undefined;
    user.confirmStringExpiration = undefined;
    await user.save({validateBeforeSave: false});
    res.status(200).json({
        status: "success",
        message: "congratulations, now you can start using our app"
    })
})

exports.login = catchAsync(async (req,res,next) => {
    if(req.headers.cookie){
        if(req.headers.cookie.includes("LotOfTries=")){
        return next(new ApiErrors("I said WAIT FOR 10MINS", 400));
        }
    }
    const {email, password} = req.body;
    const user = await User.findOne({email: email}).select("+password");

    if(!email || !password){
        return next(new ApiErrors("please provide a email and password", 400));
    }

    if(!user || !(await user.correctPass(password,user.password))) {
        points.points = points.points - 1;

        if(points.points === 0){
            points.points = 5;
            res.cookie("LotOfTries", "error", {
                maxAge: 600000,
                secure: req.secure || req.headers["x-fowarded-proto"] === "https"
            });
            return next(new ApiErrors("you fuck it up, now wait 10mins", 400));
        }
        return next(new ApiErrors("put the right password b**ch", 400));
    }
    points.points = 5;
    createSendToken(user,201, req,res);
});

exports.logout = (req,res) => {
    res.cookie("jwt", "he ded", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: "success"})
}

exports.protect = catchAsync(async (req,res,next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if(!token){
        return next(new ApiErrors("Wheres the token lowalski, WHERE IS THE GODAMN TOKEN", 401))
    }
    const decoded = await promisify(JWT.verify)(token,process.env.JWT_SECRET);
    const freshUser = await User.findById(decoded.id).select("+confirmed");
    if(!freshUser){
        return next(new ApiErrors("The user belonging to this token does no longer exist.", 401))
    }
    if(freshUser.changedPass(decoded.iat)){
        res.clearCookie("jwt");
        return next(new ApiErrors("You changed your password recently, please put the new password", 401))
    };
    if(freshUser.confirmed === false){
        return next(new ApiErrors("The user is not confirmed, please confirm", 401));
    };
    req.user = freshUser;
    next();
});

exports.isLoggedIn = catchAsync(async (req,res,next) => {
    if(req.cookies.jwt){
        if(req.cookies.jwt === "he ded"){
            return next();
        }
        const decoded = await promisify(JWT.verify)(req.cookies.jwt,process.env.JWT_SECRET);
        const freshUser = await User.findById(decoded.id).select("+confirmed");
        if(!freshUser){
            return next();
        }
        res.locals.user = freshUser;
        return next();
    }
    next();
});

exports.restrict = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ApiErrors("You cant do this kid, you are a junior, ask to your parent to do it", 403));
        }
        next();
    }
}
exports.forgotPass = catchAsync(async(req,res,next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ApiErrors("There is no user with that email adress", 404));
    }
    const resetToken = user.createPassResetToken();
    await user.save({validateBeforeSave: false});


    try{
//    await sendEmail({
//        email: user.email,
//        subject: "your password reset token (valid for 10 min)",
//        message
//    });
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "Token sent to email succesfully"
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ApiErrors("there was an error sending the email. try again"), 500);
    }
});
exports.resetPass = catchAsync(async(req,res,next) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
    if(!user){
        return next(new ApiErrors("Token is invalid or its expired, try again!", 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    createSendToken(user,201,req,res);
});

exports.updatePassword = catchAsync(async(req,res,next) => {
    const user = await User.findById(req.user.id).select("+password");
    if(!user || !await user.correctPass(req.body.password, user.password)){
        return next(new ApiErrors("BITCH, you are a thief, you know this has consequences", 401))
    }
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.newPasswordConfirm;
    await user.save();

    createSendToken(user,201,req,res);
})