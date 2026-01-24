import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation- not empty, valid email, password strength etc can be added here
    //check if user already exists
    //check for images,check for avtaar
    //upload image to cloudinary if any/avtaar
    //craete user object - create entry in db
    //remove password and refresh token fields from response
    //check for user creation sucess
    //return response
    const{fullname,email,username,password } = req.body
    console.log(req.body);
    if ([fullname,email,username,password].some((field)=>field?.trim()=== "")) {
        throw new ApiError(400,"All fields are required")
    }
    if (await User.findOne({$or: [{email}, {username}]})) {
        throw new ApiError(409,"User with given email/username already exists")
    }
    const avtaarLocalPath = req.files?.avtaar[0]?.path;
    const ImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avtaarLocalPath){
        throw new ApiError (400,"Avtaar is required")
    }
    const avtaar = await uploadToCloudinary(avtaarLocalPath)
    const coverImage = await uploadToCloudinary(ImageLocalPath)
    if (!avtaar) {
        throw new ApiError(500,"Could not upload avtaar, please try again")
        
    }
    User.create({
        fullname,
        avtaar:avtaar.url,
        coverImage: coverImage?.url || "",
        password,
        email,
        username:username.toLowerCase(),
    })

    
}
)

export { registerUser };