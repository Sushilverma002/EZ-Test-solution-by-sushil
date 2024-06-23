import fileModel from "../models/file.js";
import apiResponseHandler from "../utilites/apiResponseHanlder.js";
import jwt from "jsonwebtoken";
import path from "path";

const files = new Object();

files.uploadFile = async (req, res) => {
  console.log("*****************upload**********file");
  const { user } = req;

  try {
    const file = new fileModel({
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      uploadedBy: user._id,
    });
    await file.save();

    apiResponseHandler.sendResponse(201, true, file, (response) => {
      res.json(response);
    });
  } catch (error) {
    console.error(error);
    apiResponseHandler.sendError(
      500,
      false,
      "Something went wrong, internal server error.",
      (response) => {
        res.json(response);
      }
    );
  }
};

files.listFiles = async (req, res) => {
  try {
    const files = await fileModel.find();
    apiResponseHandler.sendResponse(200, true, files, (response) => {
      res.json(response);
    });
  } catch (err) {
    apiResponseHandler.sendError(
      500,
      false,
      "Error fetching files",
      (response) => {
        res.json(response);
      }
    );
  }
};

files.downloadFile = async (req, res) => {
  const { user } = req;
  const { fileId } = req.params;

  try {
    const file = await fileModel.findById(fileId);
    if (!file) {
      return apiResponseHandler.sendError(
        404,
        false,
        "File not found",
        (response) => {
          res.json(response);
        }
      );
    }

    const downloadToken = jwt.sign({ id: file._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const downloadLink = `http://localhost:${process.env.PORT}/api/files/download-link/${downloadToken}`;
    apiResponseHandler.sendResponse(
      200,
      true,
      { downloadLink, message: "success" },
      (response) => {
        res.json(response);
      }
    );
  } catch (err) {
    apiResponseHandler.sendError(
      500,
      false,
      "Error generating download link",
      (response) => {
        res.json(response);
      }
    );
  }
};

files.downloadFileLink = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const file = await fileModel.findById(decoded.id);
    if (!file) {
      return apiResponseHandler.sendError(
        404,
        false,
        "File not found",
        (response) => {
          res.json(response);
        }
      );
    }

    const filePath = path.join(__dirname, "../", file.path);
    res.download(filePath, file.filename);
  } catch (err) {
    apiResponseHandler.sendError(400, false, "Invalid token", (response) => {
      res.json(response);
    });
  }
};

export default files;
