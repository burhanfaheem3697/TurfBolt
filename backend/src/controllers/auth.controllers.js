import { Booking } from "../models/booking.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailVerificationMailgenToken, forgotPasswordMailgenToken, sendMail } from "../utils/mail.js";
import crypto from 'crypto'

const registerUser = asyncHandler(async (req,res) => {
    //get user data
    const {username,email,password,phone,role} = req.body
    //get file from multer
    const avatarLocalPath = req.file.path

    //check if existing user
    const existingUser = await User.findOne({email})

    if(existingUser) throw new ApiError(400,"User already exist")

    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    //create user
    const user = await User.create({username,email,password,phone,role,avatar : avatar.url})

    if(!user) throw new ApiError(400,"Error while registering user")

    //generate token
    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpires = tokenExpiry
    await user.save()

    //send email for verification
    sendMail({
        email,
        subject : "Email verification",
        mailGenContent : emailVerificationMailgenToken(username,`${process.env.BASE_URL}/api/v1/verify/${unhashedToken}`)
    })

    const safeUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone : user.phone,
        avatar : user.avatar,
        role: user.role,
        isVerified : user.isVerified
    }

    return res.status(200).json(
        new ApiResponse(200,safeUser,"User registered and mail sent successfully")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    //get user data
    const {email,password} = req.body

    //check if user exist
    const user = await User.findOne({email})

    if(!user) throw new ApiError(400,"User does not exist")

    //check password
    const isCorrect = await user.isPasswordCorrect(password)

    if(!isCorrect) throw new ApiError(400,"password is incorrect")
    
    //create access token
    const accessToken = user.generateAccessToken()
    //create refresh token
    const refreshToken = user.generateRefreshToken()

    //set refresh Token to db
    user.refreshToken = refreshToken
    await user.save()

    const options = {
        httpOnly : true,
        secure : true,
        maxAge : 24*60*60*1000
    }
    //send cookie in response
    res.cookie('tokens',JSON.stringify({accessToken,refreshToken}),options)

    const safeUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone : user.phone,
        avatar : user.avatar,
        role: user.role,
        isVerified : user.isVerified
    }

    return res.status(200).json(
        new ApiResponse(200,safeUser,"User logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    //reset the cookie
    res.cookie('token','',{expires : new Date(0)})

    return res.status(200).json(
        new ApiResponse(200,{ message : "User logged out successfully"})
    )
})

const verifyEmail = asyncHandler(async (req,res) => {
    //get token
    const {unhashedToken} = req.params

    if(!unhashedToken) throw new ApiError(400,"No token given")


    const hashedToken = crypto
    .createHash('SHA256')
    .update(unhashedToken)
    .digest('hex')

    //find user
    const user = await User.findOne({emailVerificationToken : hashedToken,emailVerificationTokenExpires : {$gt : Date.now()}})

    if(!user) throw new ApiError(400,"Token is invalid or expired")
    
    user.emailVerificationToken = undefined
    user.emailVerificationTokenExpires = undefined
    user.isVerified = true
    await user.save()

    return res.status(200).json(
        new ApiResponse(200,{message : "User verified successfully"})
    )

    
})

const forgotPassword = asyncHandler(async (req,res) => {
    //get email
    const {email} = req.body

    //check email exist
    const user = await User.findOne({email})

    if(!user) throw new ApiError(400,"User does not exist")

    //generate token
    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordTokenExpires = tokenExpiry
    await user.save()

    //send mail
    sendMail({
        email,
        subject : "Forgot Password",
        mailGenContent : forgotPasswordMailgenToken(user.username,`${process.env.BASE_URL}/api/v1/users/resetPassword/${unhashedToken}`)
    })

    return res.status(200).json(
        new ApiResponse(200,{message : "Mail sent successfully"})
    )
})

const resetPassword = asyncHandler(async (req,res) => {
    const {unhashedToken} = req.params
    if(!unhashedToken) throw new ApiError(400,"No token given")
    const {password} = req.body

    const hashedToken = crypto
    .createHash('SHA256')
    .update(unhashedToken)
    .digest('hex')

    const user = await User.findOne({forgotPasswordToken : hashedToken,forgotPasswordTokenExpires : {$gt : Date.now()}})

    if(!user) throw new ApiError(400,"Token is invalid or expired")

    user.password = password;
    user.forgotPasswordToken = undefined
    user.forgotPasswordTokenExpires = undefined
    await user.save()

    return res.status(200).json(
        new ApiResponse(200,{message : "Password changed successfully"})
    )

    
})  

const getUser = asyncHandler(async (req,res) => {
    //get user id
    const userId = req.user._id

    //check in db
    const user = await User.findById(userId)

    if(!user) throw new ApiError(400,"User does not exist")

    const safeUser = {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone : user.phone,
        avatar : user.avatar,
        role: user.role,
        isVerified : user.isVerified
    }
    
    return res.status(200).json(
        new ApiResponse(200,safeUser,"User fetched successfully")
    )

})

const refreshAccessToken = asyncHandler(async (req,res) => {
    //get token
    const token = JSON.parse(req.cookies.tokens).refreshToken

    const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)

    if(!decodedToken) throw new ApiError(400,"Token is invalid or expired")

    //get user by id

    const user = await User.findById(decodedToken.id)

    //generate tokens

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //send cookie

    const options = {
        httpOnly : true,
        secure : true,
        maxAge : 24*60*60*1000
    }

    res.cookie('tokens',JSON.stringify({accessToken,refreshToken}),options)

    return res.status(200).json(
        new ApiResponse(200,{message : "Access token refreshed successfully"})
    )
})

const resendEmail = asyncHandler(async (req,res) => {
    const userId = req.user._id
    //get user by Id 
    const user = await User.findById(userId)

    if(!user) throw new ApiError(400,"User does not exist")

    //generate token
    
    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationTokenExpires = tokenExpiry
    await user.save()

    //send mail
    sendMail({
        email : user.email,
        subject : "Email verification",
        mailGenContent : emailVerificationMailgenToken(user.username,`${process.env.BASE_URL}/api/v1/users/verify/${unhashedToken}`)

    })

    return res.status(200).json(
        new ApiResponse(200,{message : "Mail sent successfully"})
    )

})

const getUserBookings = asyncHandler(async (req,res) => {
    //get user by Id 
    const userId = req.user._id

    const bookings = await Booking.aggregate([
  {
    $match: {
      user_id: new mongoose.Types.ObjectId(userId)
    }
  },

  // Join slot
  {
    $lookup: {
      from: 'slots',
      localField: 'slot_id',
      foreignField: '_id',
      as: 'slot'
    }
  },
  { $unwind: '$slot' },

  // Join turf
  {
    $lookup: {
      from: 'turfs',
      localField: 'turf_id',
      foreignField: '_id',
      as: 'turf'
    }
  },
  { $unwind: '$turf' },

  // Join turf.owner
  {
    $lookup: {
      from: 'users',
      localField: 'turf.owner_id',
      foreignField: '_id',
      as: 'owner'
    }
  },
  { $unwind: '$owner' },

  // Flatten everything
  {
    $project: {
      bookingId: '$_id',
      slotStartTime: '$slot.startTime',
      slotEndTime: '$slot.endTime',
      slotDate: '$slot.date',
      turfName: '$turf.name',
      turfAddress: '$turf.address',
      turfPricePerHour: '$turf.pricePerHour',
      ownerName: '$owner.username',
      ownerEmail: '$owner.email',
      ownerPhone: '$owner.phone'
    }
  }
]);


    if(!bookings) throw new ApiError(400,"User has no bookings")

    return res.status(200).json(
        new ApiResponse(200,bookings,"Bookings fetched successfully")
    )

})


export {registerUser,loginUser,logoutUser,verifyEmail,resendEmail,refreshAccessToken,getUser,getUserBookings,forgotPassword,resetPassword}