import mongoose,{isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import { subscribe } from "diagnostics_channel.js";


const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params;

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel ID");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel:channelId,
    })

    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed?._id)

        return res 
        .status(200)
        .json( new ApiResponse(200,{subscribed:false},"Unsubscribed successfully"))
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    })

    return res.status(200)
    .json(new ApiResponse(200,{subscribed:true},"subscribed successfully"))
})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId} = req.params;
    const subscribers= await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,{
        totalCount: subscribers.length,
        subscribers,
    },"Subscribers fetched successfully"))
})

const getSubscribedChannels= asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params
    const channelsSubscridbedTo= await Subscription.aggregate([
        {
        $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,{
        totalChannelsSubscribedTo:channelsSubscridbedTo.length,
        channelsSubscridbedTo
    },
    "channels fetched successfully")
)
})

export {toggleSubscription,getSubscribedChannels,getUserChannelSubscribers}