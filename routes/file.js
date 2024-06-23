import files from "../controllers/fileCntrl.js";
import { Router } from "express";
import multer from "multer";
import {
  onlyClientUserAccess,
  onlyOperationUserAccess,
  Auth,
} from "../middleware/auth.js";
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
const upload = multer({ Location_storage, fileFilter });
fileRoute.post(
  "/upload",
  upload.single("file"),
  Auth,
  onlyOperationUserAccess,
  files.uploadFile
);
fileRoute.get("/list", Auth, files.listFiles);
fileRoute.get("/download/:fileId", Auth, files.downloadFile);
fileRoute.get("/download-link/:token", files.downloadFileLink);

export default fileRoute;
