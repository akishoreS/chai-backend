
import mongoose,{Schema} from "mpngoose"

const subscriptionSchema =new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, 
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref: "User"
    }
},{timeStamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)