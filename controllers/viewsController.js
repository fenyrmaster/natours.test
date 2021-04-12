const Tour = require("../models/tourModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const ApiErrors = require("../utils/appError");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");

exports.getTour =catchAsync(async (req,res,next) =>  {
  const slug = req.params.slug
  const tour = await Tour.findOne({slug: slug});
  const booking = await Booking.findOne({ tour: tour._id, user: res.locals.user._id });
  if(!tour){
    return next(new ApiErrors("The name of that tour is not valid, please put a valid name", 404))
  }
  res
  .status(200)
  .render('tour', {
    title: tour.name,
    tour,
    booking
  });
})

exports.getOveview = catchAsync(async (req,res) =>  {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All tours",
    tours
  })
})

exports.accountSet = catchAsync(async (req,res) =>  {
  res.status(200).render("accountSettings", {
    title: "My account",
    user: req.user
  })
})

exports.confirmUser = catchAsync(async (req,res) =>  {
  res.status(200).render("confirmed", {
    title: "Confirm identity"
  })
})

exports.accountRev = catchAsync(async (req,res) =>  {
  const reviews = await Review.find({ user: req.user }).populate({path: "tour"});
  const bookings = await Booking.find({ user: req.user.id });
  const tourid = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in:tourid } });
  res.status(200).render("accountReviews", {
    title: "My account",
    user: req.user,
    reviews,
    tours
  })
});

exports.tourManage = catchAsync(async (req,res) => {
  const tours = await Tour.find();
  res.status(200).render("accountTourManage", {
    title: "Manage tours",
    tours,
    user: req.user
  })
})

exports.login = catchAsync(async (req,res) => {
  res.status(200)
  .set(
    'Content-Security-Policy',
    "connect-src 'self' https://cdnjs.cloudflare.com"
  )
  .render("login", {
    title: " Login"
  })
})

exports.signup = catchAsync(async (req,res) => {
  res.status(200).render("signup", {
    title: " Sign up"
  })
})

exports.getMyBookings = catchAsync(async(req,res,next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourid = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourid } });
  res.status(200).render("overview", {
    title: "My tours",
    tours: tours,
    user: req.user
  })
})

//exports.updateUserData = catchAsync (async(req,res,next) => {
//  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
//    name: req.body.name,
//    email: req.body.email
//  },
//  {
//    new: true,
//    runValidators: true
//  }
//  );
//  res.status(200).render("accountSettings", {
//    title: "Your account",
//    user: updatedUser
//  })
//})