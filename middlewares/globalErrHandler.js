export const globalErrHandler = (error, request, response, next) => {
  // stack about the error
  const stack = error?.stack;
  // statusCode
  const statusCode = error?.statusCode ? error?.statusCode : 500;
  // messsage
  const message = error?.message;

  console.log(stack);

  response.status(statusCode).json({
    stack,
    message,
  });
};

// 404 Handler
export const notFound = (request, response, next) => {
  const error = new Error(`Route ${request.originalUrl} not found`);
  next(error);
};
