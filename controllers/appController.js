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

/*
PUT: http://localhost:8049/api/update-user
@param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export const updateUserCtrl = asyncHandler(async (request, response) => {
  const id = request.userAuthId;

  const body = request.body;

  const user = await User.findByIdAndUpdate(id, body, { new: true });

  if (user) {
    response.json({
      status: "success",
      message: "User updated successfully",
      user,
    });
  } else {
    throw new Error("User not found!");
  }
});

/*
GET: http://localhost:8080/api/generate-otp
*/
export const generateOTPCtrl = asyncHandler(async (request, response) => {
  request.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  response.status(201).send({ code: request.app.locals.OTP });
});

/*
GET: http://localhost:8080/api/verify-otp
*/
export const verifyOTPCtrl = asyncHandler(async (request, response) => {
  const { otp } = request.query;
  if (parseInt(request.app.locals.OTP) === parseInt(otp)) {
    // TODO: Reset the OTP value
    request.app.locals.OTP = null;
    // TODO: Start session for reset password
    request.app.locals.resetSession = true;
    return response.status(201).send({ message: "Verified Successfully!" });
  } else {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }
});

// TODO: successfully redirect user when OTP is valid
/*
GET: http://localhost:8080/api/create-reset-session
*/
export const createResetSessionCtrl = asyncHandler(
  async (request, response) => {
    if (request.app.locals.resetSession) {
      return response
        .status(201)
        .send({ flag: request.app.locals.resetSession });
    } else {
      const error = new Error("Session expired!");
      error.statusCode = 440;
      throw error;
    }
  }
);

// TODO: update the password when we have valid session
/*
PUT: http://localhost:8080/api/reset-password
*/
export const resetPasswordCtrl = asyncHandler(async (request, response) => {
  if (!request.app.locals.resetSession) {
    return response.status(440).send({ message: "Session expired!" });
  }

  const { username, password } = request.body;

  const userFound = await User.findOne({ username });

  if (userFound) {
    // ! hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await User.updateOne(
      { username: userFound.username },
      { password: hashedPassword }
    );

    if (result.modifiedCount === 0) {
      const error = new Error("Record not found!");
      error.statusCode = 440;
      throw error;
    }

    // ! Reset session
    request.app.locals.resetSession = false;

    return response.status(201).send({ message: "Password updated!" });
  }
});
