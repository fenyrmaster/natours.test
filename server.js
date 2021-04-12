const dotenv = require('dotenv');
const mongoose = require("mongoose");

process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

console.log(process.env.NODE_ENV);

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

const port = process.env.PORT;
const server = app.listen(port, () => {});

process.on("unhandledRejection", err => {
    console.log(err.name, err.message);
    server.close(() => {
    process.exit(1);
    });
});