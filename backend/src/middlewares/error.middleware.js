import { sendResponse } from "../utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  console.error(err.message);

  //PostgreSQL errors
  if (err.code === '23505') {
    return sendResponse(res, 409, "Duplicate data");
  }

  if (err.code === '23503') {
    return sendResponse(res, 400, "Invalid reference");
  }

  if (err.code === '23514') {
    return sendResponse(res, 400, "Invalid value");
  }

  //Custom Validation errors
  if (err.message) {
    return sendResponse(res, 400, err.message);
  }

  /**-----------------------Multer Errors-----------------------*/
  //Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return sendResponse(res, 400, "File size exceeds 20MB limit");
  }

  //Multer file type error
  if (err.message.includes("Invalid file type")) {
    return sendResponse(res, 400, err.message);
  }
  /**-----------------------End Multer-----------------------*/

  sendResponse(res, 500, 'Internal Server Error');
};

export default errorMiddleware;