const path = require("path");
const express = require('express');
const morgan = require('morgan');
const csp = require("express-csp");
const ApiErrors = require("./utils/appError");
const errorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const viewRouter = require("./routes/viewRoutes");
const cookiePareser = require("cookie-parser");

const app = express();

app.set("view engine", "pug");
app.set("views",path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")))
// wow
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ['none'],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: ["'self'", 'data:', 'blob:'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: [
          "'self'",
          'blob:',
          'wss:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          "http://127.0.0.1:3000/api/v1/users/login"
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: "Too many request from this IP, Please try again in an hour" 
});
app.use("/api",limiter);

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require("./routes/bookingsRoutes");
const reviewRouter = require("./routes/reviewRoutes");

app.enable("trust proxy");

app.use(express.json({limit: "10kb"}));
app.use(cookiePareser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitizer());
app.use(xss());
app.use(hpp({
  whitelist: ["duration", "ratingQuantity", "ratingsAverage", "maxGroupSize", "difficulty","price"]
}));

app.use(compression());

app.use("/", viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);


app.all("*", (req,res,next) => {
  const err = new ApiErrors(`the given URL (${req.originalUrl}) is not valid`, 404);
  next(err);
});

app.use(errorHandler);

module.exports = app;
