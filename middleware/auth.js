import apiResponseHandler from "../utilites/apiResponseHanlder.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const Auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
      ? req.header("Authorization").replace("Bearer ", "")
      : req.body?.token;

    if (!token) {
      apiResponseHandler.sendError(
        401,
        false,
        "Access denied. Token not provided.",
        function (response) {
          res.json(response);
        }
      );
    }

    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decode;
    } catch (error) {
      apiResponseHandler.sendResponse(
        401,
        false,
        "Invalid token. Please provide a valid token for authentication.",
        function (response) {
          return res.json(response);
        }
      );
    }
    return next();
  } catch (error) {
    apiResponseHandler.sendResponse(
      401,
      false,
      "Invalid token. Please provide a valid token for authentication.",
      function (response) {
        return res.json(response);
      }
    );
  }
};

const onlyClientUserAccess = (req, res, next) => {
  try {
    if (req.user.role !== "ops") {
      apiResponseHandler.sendResponse(
        400,
        false,
        "Access Denied,this is Protected route for operation user  only.",
        function (response) {
          res.json(response);
        }
      );
    }
  } catch (error) {
    apiResponseHandler.sendResponse(
      401,
      false,
      "user role not matching",
      function (response) {
        return res.json(response);
      }
    );
  }
};

const onlyOperationUserAccess = (req, res, next) => {
  try {
    if (req.user.role !== "User") {
      apiResponseHandler.sendResponse(
        400,
        false,
        "Access Denied,this is Protected route for Client user only.",
        function (response) {
          res.json(response);
        }
      );
    }
  } catch (error) {
    apiResponseHandler.sendResponse(
      401,
      false,
      "user role not matching",
      function (response) {
        return res.json(response);
      }
    );
  }
};

export { onlyClientUserAccess, onlyOperationUserAccess, Auth };
