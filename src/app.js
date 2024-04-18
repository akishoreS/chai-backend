import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))

app.use(express.json({limit:"16kb"}))//take input data maximum upto 16 kn
app.use(express.urlencoded({extended:true,limit:"16kb"}))//get data encode with url
app.use(express.static("public"))//to store publuc data accesiv]ble by anyone
app.use(cookieParser()) 

//routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)


export{app}