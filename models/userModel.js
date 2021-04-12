const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please provide a valid Email"]
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: true,
        minlength: [8, "A password should have at least 8 characters"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    confirmString: String,
    confirmStringExpiration: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    confirmed: {
        type: Boolean,
        default: false,
        select: false
    }
});

userModel.methods.correctPass = async function(canPass, userPass) {
    return await bcrypt.compare(canPass, userPass);
}

userModel.methods.changedPass = function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const timestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < timestamp;
    }
    return false;
}

userModel.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userModel.pre("save", function(next){
    if(!this.isModified("password" || this.isNew)) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userModel.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
})

userModel.methods.createPassResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10*60*1000;
    return resetToken;
}

userModel.methods.confirmUser = function() {
    const token = crypto.randomBytes(32).toString("hex");
    this.confirmString = crypto.createHash("sha256").update(token).digest("hex");
    this.confirmStringExpiration = Date.now() + 30*24*60*60*1000;
    return token;
}

const User = mongoose.model("User", userModel);
module.exports = User;