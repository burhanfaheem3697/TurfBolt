import {body} from 'express-validator'

export const userRegistrationValidator = () => {
    return [
        body('username')
            .trim()
            .notEmpty().withMessage("username is required")
            .isLowercase().withMessage("username should be in lowercase")
            .isLength({min : 3}).withMessage("username should be at least 3 char")
            .isLength({max : 13}).withMessage("username should not exceed 13 char"),
        body('email')
            .trim()
            .notEmpty().withMessage("email is required")
            .isEmail().withMessage("email is invalid"),
        body('password')
            .trim()
            .notEmpty().withMessage("password is required")
            .isStrongPassword().withMessage("password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a symbol."),
        body('phone')
            .notEmpty().withMessage("phone number is required")
            .isLength({min : 10,max : 10}).withMessage("phone number should be of 10 digits")
        

    ]
}

export const userLoginValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("email is required")
            .isEmail().withMessage("email is invalid"),
        body('password')
            .trim()
            .notEmpty().withMessage("password is required")
            .isStrongPassword().withMessage("password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a symbol."),
    ]
}