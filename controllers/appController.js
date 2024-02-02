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

/*
POST: http://localhost:8049/api/login
@param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export const loginCtrl = asyncHandler(async (request, response) => {
  const { username, password } = request.body;

  const userFound = request?.userFound;

  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    response.json({
      status: "success",
      message: "User LoggedIn Successfully",
      // userFound,
      userFound: {
        username: userFound?.username,
      },
      // generate jwt token
      token: generateToken(userFound?._id),
    });
  } else {
    const error = new Error("Invalid Login Credentials");
    error.statusCode = 404;
    throw error;
  }
});

/*
GET: http://localhost:8049/api/user/example123
*/
export const getUserCtrl = asyncHandler(async (request, response) => {
  const { username } = request.params;

  if (!username) {
    throw new Error("Invalid Username");
  }

  const user = await User.findOne({ username });

  if (!user) {
    const error = new Error("Couldn't find the user");
    error.statusCode = 404;
    throw error;
  } else {
    // ! remove password from user
    // ! mongoose return unnecessary data with object so convert it into json
    const { password, ...rest } = Object.assign({}, user.toJSON());
    response.status(201).send({
      status: "success",
      message: "User data fetched successfully",
      data: rest,
    });
  }
});
