import User from "../model/User.js";

export default async function verifyUser(request, response, next) {
  try {
    const { username } =
      request.method === "GET" ? request.query : request.body;

    // console.log(username);

    // TODO: Check the user existence
    let usernameExists = await User.findOne({ username });
    // let usernameExists = await User.findOne(username);
    if (!usernameExists) {
      return response.status(404).send({ message: "Can't find the user!" });
    }
    request.userFound = usernameExists;
    next();
  } catch (error) {
    console.log(error);
    response.status(404).send({ message: "Authentication Error" });
  }
}
