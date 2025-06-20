import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    turf_id : {
        type : mongoose.Types.ObjectId,
        ref : "Turf",
        required : true
    },
    slot_id : {
        type : mongoose.Types.ObjectId,
        ref : "Slot",
        required : true
    },
    status : {
        type : String,
        enum : ['pending','confirm','cancel'],
        default : 'pending'
    },
    paymentStatus : {
        type : String,
        enum : ['pending','paid'],
        default : 'pending'
    }
},{timestamps : true})


export const Booking = mongoose.model("Booking",bookingSchema)