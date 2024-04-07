import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB= async() => {
    console.log('-- Attempting to connect to MongoDB at:', process.env.MONGODB_URI);
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("MONGODB connection error ",error);
        process.exit(1)
    }
}
export default connectDB;