import mongoose ,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId}= req.params
    const {page =1,limit=30}=req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invaid video ID")
    }

    const skip =(page-1)*limit;
    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $skip:skip
        },
        {
            $limit: limit
        },
        {
            $sort:{createdAt : -1}
        }
    ])

    return res.status(200).json(new ApiResponse(200,{comments},"comments fetched Successfully"))
})

const addComment = asyncHandler(async(req,res)=>{
    const {videoId}= req.params
    const {content}= req.body

    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not Found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{comment},"New comment created Successfully"))
})
const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Inavlid comment id")
    }

    const {content} = req.body
    const comment = await Comment.findByIdAndUpdate(
        {
            _id:commentId,
        },
        {
            $set:{
                content:content
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,{comment},"comment updated successfully"))
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const comment = await Comment.findByIdAndDelete(commentId)

    return res.status(200)
    .json(new ApiResponse(200,{},"Deleted the comment"))

})

export{
    getVideoComments,
    updateComment,
    addComment,
    deleteComment
}