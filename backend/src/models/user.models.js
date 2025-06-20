import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        lowercase : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        required : true,
        unique : true,
    },
    role : {
        type : String,
        enum : ["user", "owner"],
        default : "user"
    },
    avatar : {
        type : String,
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    emailVerificationToken : {
        type : String,
    },
    emailVerificationTokenExpires : {
        type : Date
    },
    forgotPasswordToken : {
        type : String,
    },
    forgotPasswordTokenExpires : {
        type : Date
    },
    refreshToken : {
        type : String
    }



},{timestamps : true})


export const User = mongoose.model("User",userSchema)