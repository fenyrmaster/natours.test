const dotenv = require('dotenv');
const mongoose = require("mongoose");
const fs = require("fs");
const Tour = require("./../../models/tourModel");
const Review = require("./../../models/reviewModel");
const User = require("./../../models/userModel");

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));
const importData = async () => {
    try{
        await Tour.create(tours);
        await Review.create(reviews);
        await User.create(users, { validateBeforeSave: false });
        process.exit();
    } catch(err){
        process.exit();
    }
}
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
    } catch(err){
        process.exit();
    }
}
if(process.argv[2] === "--import"){
    importData();
} else if(process.argv[2] === "--delete"){
    deleteData();
}