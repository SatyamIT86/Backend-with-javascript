import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResonse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessTokenAndRefereshTokens =async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefershToken();
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave:false});
        await user.save();
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Could not generate tokens, please try again")
    }
} 


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

    const { fullname, email, username, password } = req.body;
    console.log(req.body);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (await User.findOne({ $or: [{ email }, { username }] })) {
        throw new ApiError(409, "User with given email/username already exists");
    }
    // console.log(req.files);

    // ✅ FIX: safe access for multer.fields
    const avtaarLocalPath = req.files?.avtaar?.[0]?.path;
    const ImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avtaarLocalPath) {
        throw new ApiError(400, "Avtaar is required");
    }

    // ✅ FIX: Cloudinary returns URL string
    const avtaar = await uploadToCloudinary(avtaarLocalPath);

    // ✅ FIX: upload cover image ONLY if present
    const coverImage = ImageLocalPath
        ? await uploadToCloudinary(ImageLocalPath)
        : "";

    if (!avtaar) {
        throw new ApiError(500, "Could not upload avtaar, please try again");
    }

    const user = await User.create({
        fullname,
        avtaar: avtaar,
        coverImage: coverImage || "",
        password,
        email,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Could not create user, please try again");
    }

    return res
        .status(201)
        .json(new ApiResonse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async(req,res)=>{
        //req body --> data from frontend
        //username or email
        //find the user in db
        //password match
        //acess token and refresh token generate
        //send cookies and response
        const {username,email,password} = req.body;

        if(!username || !email){
            throw new ApiError(400,"username or password is required")
        }

        const user = await User.findOne({$or:[{username:username.toLowerCase()},{email}]})

        if(!user){
            throw new ApiError(404,"User does not exist")
        }
        const isPasswordValid = await user.isPasswordCorrect(password)

         if(!isPasswordValid){
            throw new ApiError(401,"Password is incorrect")
        }
    })

export { registerUser,loginUser };
