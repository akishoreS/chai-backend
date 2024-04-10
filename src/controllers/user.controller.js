import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { create } from "domain";

const registerUser = asyncHandler(async (req,res) => {
   // get user details from frontend
   //validation-not empty
   //check if user already exists:userNAme/email
   //check  for images,check for avatar
   //create user object-create entry in db
   // remove password and refresh token from response
   //check for user creation
   // return response



  const{fullName,email,username,password} =req.body
  console.log("email:",email);
//   if(fullName=== ""){
//     throw new ApiError(400,"fullname is required")
//   } we can check one by one like this also

if(
[fullName,email,username,password].some((field) => field?.trim()==="")
){
    throw new ApiError(400,"All fields are required")
}

 User.findOne({
    $or:[{email},{username}]
})
if(existedUser){
    throw new ApiError(409,"uSER WITH eMAIL aLREADY eXISTS")
}



//avatar
 const avatarLocalPath=req.files?.avatar[0]?.path//files from multer
 const coverImagePath=req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file required ")
 }

const avatar=await uploadOncloudinary(avatarLocalPath)
const coverImage =await uploadOnCloudinary(coverImagePath)

if(!avatar){
    throw new ApiError(400,"Avatar file Required")
}

 const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url|| "",
    email,
    password,
    username:username.toLower()
 })

 //check fro user craetion

const created_user=await User.findById(user._id).select(
    "-password -refreshToken"
)

    if(!created_user){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,created_user,"User registered Successfully")
    )



} )

export {
    registerUser,
}