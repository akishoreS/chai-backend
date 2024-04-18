import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config(); 

connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server running on port : ${process.env.PORT}`);
    })
})
.catch((err)=> {
    console.log("MONGO db connection failed !!!",err);
})

 












/*
  import express from "express"
  const app = express
//   function connectDB(){}
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",()=> {
            console.log("ERRR: ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`);
        })
    }catch(error){
        console.error("ERROR: ",error)
        throw err
    }
})()
*/