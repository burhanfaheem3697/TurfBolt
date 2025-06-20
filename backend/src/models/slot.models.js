import mongoose from 'mongoose'

const slotSchema = new mongoose.Schema({
    turf_id : {
        type : mongoose.Types.ObjectId,
        ref : "Turf",
        required : true
    },
    startTime : {
        type : String
    },
    endTime : {
        type : String
    },
    isBooked : {
        type : Boolean
    },
    Date : {
        type : Date
    }   
},{timestamps : true})


export const Slot = mongoose.model("Slot",slotSchema)