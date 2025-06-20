import mongoose from 'mongoose'
import { amenitiesEnum,availableAmenities } from '../utils/constants'
const turfSchema = new mongoose.Schema({
    owner_id : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    name : {
        type : String,
        unique : true,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    locationLat : {
        type : Number,
        required : true
    },
    locationLng : {
        type : Number,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    amenities : {
        type : [String],
        enum : availableAmenities,
        default : []
    },
    pricePerHour : {
        type : Number,
    },
    openTime : {
        type : String
    },
    closeTime : {
        type : String
    }
},{timestamps : true})


export const Turf = mongoose.model("Turf",turfSchema)