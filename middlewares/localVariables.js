export default function localVariables(request, response, next) {
  request.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
}
