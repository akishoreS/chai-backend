import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"//jwt is a bearer token-whoever has the token has the access
import bcrypt from"bcrypt"

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, //cloudinary url
        required:true
    },
    coverImage:{
        type:String,
        required:true
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    refreshToken:{
        type:String
    }

},{
   timestamps:true 
})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return nexr();

    this.password=bcrypt.hash(this.password,10)
    next()
})//encoding/encrypting password using hooks \\

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}//to decode password and check whether the password is correct or not

//

userSchema.methods.generateAccessTorkn=function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}


//

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User=mongoose.model("User",userSchema)