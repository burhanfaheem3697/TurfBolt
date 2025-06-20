import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/apiError'
import { User } from '../models/user.models'

export const verifyJWT = asyncHandler(async (req,res,next) => {
    const {accessToken} = req.cookies

    if(!accessToken) throw new ApiError(401,"Token not found")
    
    //check if token is valid or not
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)

    if(!decodedToken) throw new ApiError(401,"Token is invalid or expired")
    
    const user = await User.findById(decodedToken.id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires -forgotPasswordToken -forgotPasswordTokenExpires")

    if(!user) throw new ApiError(401,"Token is invalid")

    req.user = user
    next()
})