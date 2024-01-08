import mongoose from 'mongoose'
import config from "../config";

mongoose.connect(config.mongoUr);
export const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});