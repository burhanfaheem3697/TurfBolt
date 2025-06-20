import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError";

export const validate = (req,res,next) => {
    const errors = validationResult(req)

    if(!errors) return next();
    const extractedError = []
    errors.array().map(err => extractedError.push({
        [err.path] : err.msg
    }))

    throw new ApiError(401,"Received data is not valid",extractedError)
}