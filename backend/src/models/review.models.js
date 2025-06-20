import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
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
    rating : {
        type : Number,
        min : 1,
        max : 5,
        required : true

    },
    comment : {
        type : String
    }
},{timestamps : true})


export const Review = mongoose.model("Review",reviewSchema)