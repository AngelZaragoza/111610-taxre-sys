function errorMiddleware(error, req, res, next) {
  let { status = 500, message, data } = error;

  console.log(`Error en middleware -------- ${error}`);

  processedError = {
    success: false,
    status,
    message,
    data
    // ...(data) && data,
  };

  res.status(status).json(processedError);
}

module.exports = errorMiddleware;