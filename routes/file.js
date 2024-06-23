import files from "../controllers/fileCntrl.js";
import { Router } from "express";
import multer from "multer";
import { onlyOperationUserAccess, Auth } from "../middleware/auth.js";
const fileRoute = Router();

let Location_storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, process.cwd() + "/uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
let upload = multer({ Location_storage });
fileRoute.post(
  "/upload",
  Auth,
  onlyOperationUserAccess,
  upload.single("file"),
  files.uploadFile
);
fileRoute.get("/list", Auth, files.listFiles);
fileRoute.get("/download/:fileId", Auth, files.downloadFile);
fileRoute.get("/download-link/:token", files.downloadFileLink);

export default fileRoute;
