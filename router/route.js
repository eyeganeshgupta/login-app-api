import { Router } from "express";
import {
  createResetSessionCtrl,
  generateOTPCtrl,
  getUserCtrl,
  loginCtrl,
  registerCtrl,
  resetPasswordCtrl,
  updateUserCtrl,
  verifyOTPCtrl,
} from "../controllers/appController.js";
import verifyUser from "../middlewares/verifyUser.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import localVariables from "../middlewares/localVariables.js";
import registerMail from "../controllers/mailer.js";

const router = Router();

// ! --- GET Methods ---
// * User with username
router.route("/user/:username").get(getUserCtrl);

// * Generate random OTP
router.route("/generate-otp").get(verifyUser, localVariables, generateOTPCtrl);

// * Verify generated OTP
router.route("/verify-otp").get(verifyUser, verifyOTPCtrl);

// * Reset all the variables
router.route("/create-reset-session").get(createResetSessionCtrl);

// ! --- POST Methods ---
// * Register user
router.route("/register").post(registerCtrl);

// * Send the email
router.route("/register-mail").post(registerMail);

// * Authenticate user
router.route("/authenticate").post(verifyUser, (request, response) => {
  response.status(200);
  response.end();
});

// * Login user
router.route("/login").post(verifyUser, loginCtrl);

// ! --- PUT Methods ---
// * Update the user profile
router.route("/update-user").put(isLoggedIn, updateUserCtrl);

// * Reset password
router.route("/reset-password").put(verifyUser, resetPasswordCtrl);

export default router;
