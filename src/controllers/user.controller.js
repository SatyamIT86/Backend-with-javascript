import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"; 
import {asyncHandler} from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({message: "User registered successfully"});
}
)

export {registerUser};