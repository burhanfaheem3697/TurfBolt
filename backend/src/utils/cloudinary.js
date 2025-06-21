import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

export const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null
    try {
        const response = await cloudinary.uploader.upload(localFilePath,{resource_type : "auto"})

        fs.unlinkSync(localFilePath)

        return response
    } catch (error) {
        return null
    }
}