import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    title : {
        type : String
    },
    message : {
        type : String,
    },
    readStatus : {
        type : Boolean,
        default : false
    }
},{timestamps : true})


export const Notification = mongoose.model("Notification",notificationSchema)