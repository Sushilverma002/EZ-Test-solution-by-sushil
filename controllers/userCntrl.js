import userModel from "../models/user.js";
import mailer from "../utilites/mailer.js";
import apiResponseHandler from "../utilites/apiResponseHanlder.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const user = Object();

user.register = async (req, res) => {
  try {
    // step 1 : fetch user data
    const { name, email, password, role } = req.body;

    // step 2 : all fields required
    if (!name || !email || !password || !role) {
      return apiResponseHandler.sendError(
        403,
        false,
        "All fields are required.",
        function (response) {
          res.json(response);
        }
      );
    }

    // step 3 : check wheather user already exsist

    const isExisit = await userModel.findOne({ email });

    // step 4 : if user exsist, go for login

    if (isExisit) {
      return apiResponseHandler.sendError(
        400,
        false,
        "User already exisit, please login.",
        function (response) {
          res.json(response);
        }
      );
    }
    //step 5 password hashing
    const hashPassword = await bcrypt.hash(password, 15);
    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    //token creation

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    user.token = token;
    user.password = undefined;

    // step 6 : mail verfiy

    const url = `http://localhost:${process.env.PORT}/api/v1/verfiyEmail/${token}`;
    const verfiyMail = await mailer(
      email,
      "for verifiy email",
      `<a href="${url}">Verify your email</a>`
    );
    if (verfiyMail) {
      apiResponseHandler.sendResponse(
        200,
        true,
        "User registered. Please check your email to verify.",
        function (response) {
          res.json(response);
        }
      );
    }
  } catch (error) {
    console.log(error);
    apiResponseHandler.sendError(
      500,
      false,
      "Something went wrong, internal sever error.",
      function (response) {
        res.json(response);
      }
    );
  }
};

user.verfiyMail = async (req, res) => {
  try {
    //step 1 : fetching id
    const { token } = req.params;

    if (!token) {
      apiResponseHandler.sendResponseMsg(
        403,
        false,
        "All fields are required, please try again.",
        function (response) {
          res.json(response);
        }
      );
    }
    // step 2 : just verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      apiResponseHandler.sendResponseMsg(
        400,
        false,
        "Invalid token",
        function (response) {
          res.json(response);
        }
      );
    }
    //step 3 : mark is verified field as true
    user.isVerified = true;
    await user.save();

    apiResponseHandler.sendResponse(
      200,
      true,
      "Email verified successfully",
      function (response) {
        res.json(response);
      }
    );
  } catch (error) {
    console.log(error);
    apiResponseHandler.sendError(
      500,
      false,
      "Something went wrong, internal sever error.",
      function (response) {
        res.json(response);
      }
    );
  }
};

user.login = async (req, res) => {
  try {
    //step 1 : fetch data
    const { email, password } = req.body;

    //* data required
    if (!email || !password) {
      apiResponseHandler.sendResponse(
        403,
        false,
        "All fields are required, please try again.",
        function (response) {
          res.json(response);
        }
      );
    }

    //step 2 check wheather user exisit
    const user = await userModel.findOne({ email });

    // step 3: password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
      };
      //step 4 : jwt token creation
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      if (!user.isVerified) {
        return apiResponseHandler.sendError(
          400,
          false,
          "email not verified",
          function (response) {
            res.json(response);
          }
        );
      }
      const result = {
        message: "user Login successfully.",
        token: token,
        user: user,
      };

      apiResponseHandler.sendResponse(200, true, result, function (response) {
        res.json(response);
      });
    } else {
      return apiResponseHandler.sendResponse(
        400,
        false,
        "password is incorrect.",
        function (response) {
          res.json(response);
        }
      );
    }
  } catch (error) {
    console.log(error);
    apiResponseHandler.sendError(
      500,
      false,
      "Something went wrong, internal sever error.",
      function (response) {
        res.json(response);
      }
    );
  }
};
export default user;
