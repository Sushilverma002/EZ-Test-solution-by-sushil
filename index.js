import MongoDB from "./configration/databaseConfig.js";
import mongoose from "mongoose";
import express, { json } from "express";
import router from "./routes/index.js";
import fileRoute from "./routes/file.js";
const app = express();
const port = process.env.PORT || 4000;

app.use("/api/v1", router);
app.use("/api/v1/fileUpload", fileRoute);
app.use(express.json());

//it use to upload the file tempfolder
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

cloudnaryConnect();

const start = async () => {
  try {
    await MongoDB(process);
    app.listen(port, () => {
      console.log(`Yes I am connected`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
