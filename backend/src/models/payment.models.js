import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    booking_id : {
        type : mongoose.Types.ObjectId,
        ref : "Booking",
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['pending','success','failed'],
        default : 'pending'
    }

},{timestamps : true})


export const Payment = mongoose.model("Payment",paymentSchema)