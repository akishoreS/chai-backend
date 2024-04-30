import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async(req,res)=>{

    const {page=1,limit=20,query,sortBy,sortType,userId}=req.query
    const skip=(page - 1)*limit

    const videos= Video.aggregate([
        {
            $skip:skip
        },
        {
            $limit:limit
        },
        {
            $sort:{createdAt:-1}
        }
    ])

    if(!videos){
        throw new ApiError(404,"No videos found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{videos},"all videos fetched Successfully"))

})

const publishVideo= asyncHandler(async(req,res)=>{
    const {title,description}=req.body;

    const videoLocalPath=req.files?.videofile[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path;

    if(!videoLocalPath|| !thumbnailLocalPath){
        throw new ApiError(400,"video file or thumbnail is not provided");
    }

        const videoFile=await uploadOnCloudinary(videoLocalPath)
        const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

        if(!videoFile || !thumbnail){
            throw new ApiError(500,'error while uploading video file on cloudinary')
        }

        if(!title){
            throw new ApiError(400,"Title field cannot be empty")

        }
        const user= await User.findById(req.user?._id)

        const video= await Video.create({
            videoFile: videoFile?.url,
            thumbnail:thumbnail?.url,
            title,
            description,
            duration:videoFile?.duration,
            owner:user._id
        })
        return res
        .status(200)
        .json(new ApiResponse(200,{video},"Video uploaded Successfully"))
    
})

const getVideoById = asyncHandler(async(req,res)=>{
    const{videoId}= req.params

    let video= await Video.findById(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,{video},"video fetched successfully"))
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    const{title,description}= req.body

    // Correct way to access the file path when using upload.single('thumbnail')
    
    const thumbnailLocalPath = req.file ? req.file.path : null;
    
    console.log(thumbnailLocalPath)

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }

    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500,"Failed to upload thumbnail on cloudinary")
    }

    let video = await Video.findByIdAndUpdate(videoId,{
        $set:{
            thumbnail:thumbnail?.url||"",
            title: title||"",
            description: description ||""
        },
    },{
        new:true
    }
);

return res
.status(200)
.json(new ApiResponse(200,{video},"video Details updated Successfully"))
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const{videoId}= req.params
    const video= await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(404,"Video not Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"video deleted Successfully"))
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}= req.params

    const video = await Video.findById(videoId)
    const publishStatus= !video.isPublished

    await video.updateOne({isPublished:publishStatus})

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Video Publish Status has been changed to ${publishStatus}'))
})

export {
    togglePublishStatus,
    deleteVideo,updateVideo,
    getAllVideos,getVideoById,
    publishVideo
}