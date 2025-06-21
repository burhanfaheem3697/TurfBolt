import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import crypto, { hash } from 'crypto'
dotenv.config()
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
        required : true,
        select : false
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
        type : Date,
    },
    forgotPasswordToken : {
        type : String,
    },
    forgotPasswordTokenExpires : {
        type : Date,
    },
    refreshToken : {
        type : String,
    }



},{timestamps : true})


userSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password,10)

    return next()
})

userSchema.methods.generateTemporaryToken = function(){
    const unhashedToken = crypto.randomBytes(32).toString('hex')

    const hashedToken = crypto
    .createHash('SHA256')
    .update(unhashedToken)
    .digest('hex')

    const tokenExpiry = Date.now() + 20*60*1000 //20 min

    return {unhashedToken,hashedToken,tokenExpiry}
}

userSchema.methods.generateAccessToken = function(){
    const accessToken = jwt.sign({
        id : this._id,
        email : this.email,
        username : this.username
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn : process.env.ACCESS_TOKEN_EXPIRY})

    return accessToken
}

userSchema.methods.generateRefreshToken = function(){
    const refreshToken = jwt.sign({
        id : this._id
    },process.env.REFRESH_TOKEN_SECRET,{expiresIn : process.env.REFRESH_TOKEN_EXPIRY})

    return refreshToken
}

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


export const User = mongoose.model("User",userSchema)