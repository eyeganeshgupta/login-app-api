export const getTokenFromHeader = (request) => {
  const token = request?.headers?.authorization?.split(" ")[1];
  console.log(token);
  if (token === undefined) {
    return "No token found in the header";
  }
  return token;
};
