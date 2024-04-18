import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
// import { access } from "fs";
// import { create } from "domain";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user =await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and acess token")
        
    }
}


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
//   console.log("email:",email);
//   if(fullName=== ""){
//     throw new ApiError(400,"fullname is required")
//   } we can check one by one like this also

if(
[fullName,email,username,password].some((field) => field?.trim()==="")
){
    throw new ApiError(400,"All fields are required")
}
const existedUser= await User.findOne({
    $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"uSER WITH eMAIL aLREADY eXISTS")
}



//avatar
 const avatarLocalPath= req.files?.avatar[0]?.path;//files from multer
//  const coverImagePath=req.files?.coverImage[0]?.path;

 let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
    coverImageLocalPath= req.files.coverImage[0].path
} 

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file required ")
 }

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage =await uploadOnCloudinary(coverImageLocalPath)


if(!avatar){
    throw new ApiError(400,"Avatar file Required")
}

 const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url|| "",
    email,
    password,
    username:username.toLowerCase()
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

const loginUser=asyncHandler(async(req,res)=>{
    //req body->date
    //username or email
    //find the user
    //password 
    //access and refresh token
    //send cookie;

    const {email,username,password}=req.body

    if(!username || !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}] //$ is a mongodb operator,this will find user on the basis of username or email
    })
    if(!user){
        throw new ApiError(404,"User does not exists")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
   }

   const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

   const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },
            "User Logged in Successfully"
        )
   )


})

const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user= await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options= {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken)
        .cookie("NewRefreshToken",newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token Refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Inavlid Refresh Token")
        
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}