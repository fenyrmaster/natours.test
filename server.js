const dotenv = require('dotenv');
const mongoose = require("mongoose");

process.on("uncaughtException", err => {
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

const port = process.env.PORT;
const server = app.listen(port, () => {});

process.on("unhandledRejection", err => {
    server.close(() => {
    process.exit(1);
    });
});