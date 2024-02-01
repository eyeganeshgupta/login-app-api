import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isLoggedIn = (request, response, next) => {
  // 1. get token from header
  const token = getTokenFromHeader(request);
  // 2. verify token
  const decodedUser = verifyToken(token);
  // 3. save the user into request object
  if (!decodedUser) {
    throw new Error("Invalid/Expired token, please login again");
  } else {
    // save the user into request object
    request.userAuthId = decodedUser?.id;
    next();
  }
};
