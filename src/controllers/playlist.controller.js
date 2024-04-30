import mongoose,{isValidObjectId} from "mongoose";
import {playlist} from"../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body

    const Playlist = await playlist.findOne({
        name: name,
        owner: req.user?._id
    })

    if(Playlist){
        throw new ApiError(409,"This playlist already exists.")
    }

    const newPlaylist = await playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{newPlaylist},"Playlist created Successfully"))
})

const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const userPlaylists =await playlist.find({owner:userId}).sort('-createdAt')
    return res.status(200).json(new ApiResponse(200,userPlaylists,"User's Playlists fetched successfully"))
})

const getPalylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    const Playlist = await playlist.findById(playlistId)

    if(!Playlist){
        throw new ApiError(404,"playlist not found")
    }
    return res.status(200).json(
        new ApiResponse(200, Playlist ||{},"Playlist details fetched successfully" )
    )
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params

    if(!isValidObjectId(videoId)||!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId or viddeoId")
    }

    const playlist = await playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video not found")
    }

    const isIncluded = playlist.videos.includes(video._id)

    if(isIncluded){
        throw new ApiError(409,"this video alredy in this palylist")
    }

    const addVideo= await playlist.updateOne(
        {
            _id:playlistId,
        },
        {
            $push:{
                videos:video
            }
        },
        {
            new :true
        }

    )
    return res.status(200).json(new ApiResponse(200,{addVideo},"video added to the palylist successfully"))
})

const removeVideoFromPlaylist= asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params
    const playlist = await playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"this video isn't in your playlist")
    }
    const removeIndex = playlist.videos.indexOf(videoId)

    if(removeIndex==-1){
        throw new ApiError(400,"video doesn't exist")
    }

    const removeVideo = await playlist.updateOne(
        {
        _id:playlistId,
        },
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new: true
        }
)
return res.status(200).json(new ApiResponse(200,{removeVideo},"the video has been deleted from playlist."))

})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    let Playlist = await playlist.findByIdAndDelete(playlistId)
    if(!Playlist){
        throw new ApiError(404,"playlist not found")
    }
    return res.status(200).json(new ApiResponse(200,{},"the Playlist was sucessfully deleted"))
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name,description}= req.body


    let Playlist = await playlist.findByIdAndUpdate(
        {
            _id:playlistId
        },
        {
            $set:{
                name,
                description
            }
        },
        {
            new:true
        }
    )
    return res.status(400).json(new ApiResponse(200,{Playlist},"The Playlist has been updated"))
})

export{
    createPlaylist,
    getPalylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}