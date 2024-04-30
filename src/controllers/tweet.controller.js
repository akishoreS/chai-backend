import mongoose,{isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req,res) => {

    const user= await User.findById(req.user?._id);
    const{content}= req.body;

    if(!user){
        throw new ApiError(401,"Not Authenticated");

    }
    if(!content){
        throw new ApiError(400,"Content Field Required")
    }

    const tweet = await Tweet.create({
        content: content,
        owner:user._id,
    });

    return res.status(200)
    .json(
        new ApiResponse(200,{tweet},"tweet created successfully")
    )
})


const getUserTweet = asyncHandler(async(req,res)=>{
    const{userId}= req.params;
    const tweets = await Tweet.aggregate([{
        $match:{
            owner:new mongoose.Types.ObjectId(userId)
        }
    }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,{tweets},"successfully got the tweets"));
})

const updateTweet = asyncHandler(async(req,res)=>{

    
    const tweetId = req.params.tweetId;
    const {content}= req.body;


    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID format");
    }
    let tweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        { $set: { content } }, // Correctly setting the content to a string
        { new: true }
    );

    return res
    .status(200)
    .json(new ApiResponse(200,{tweet},"Successfully updated the tweet"))
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    let tweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet deleted successfully"))

})


export {
    updateTweet,
    getUserTweet,
    createTweet,
    deleteTweet
}