import bcrypt from "bcrypt";
import User from "../model/User.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import otpGenerator from "otp-generator";

/*
POST: http://localhost:8049/api/register
@param: {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "ganesh",
  "lastName": "gupta",
  "mobile": 898397175,
  "address" : "Apt. 556, Valai Pada Road, Vasai",
  "profile": ""
}
*/
export const registerCtrl = asyncHandler(async (request, response) => {
  const { username, email, password, profile } = request.body;

  // TODO: check existing username
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    // throw error
    throw new Error("Username already exists");
  }

  // TODO: check for existing email
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    // throw error
    throw new Error("Email already exists");
  }

  // ! hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // TODO: register the user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    profile: profile || "",
  });

  response.status(201).json({
    // status: "success",
    message: "User Registered Successfully",
    // data: user,
  });
});
