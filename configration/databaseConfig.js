import mongoose from "mongoose";
import { config } from "dotenv";
config();

const URL = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(URL);
    console.log("db is connected.");
  } catch (error) {
    console.log(error);
    console.log("db is not connected.");
  }
};

export default connectDb;
