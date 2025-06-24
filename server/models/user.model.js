import mongoose, { Schema } from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Provide name"]
    },
    email:{
        type:String,
        required:[true,"Provide email"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Provide password"]
    },
    avatar:{
        type:String,
        default:""
    },
    number:{
        type:String,
        default:""
    },
    refresh_token:{
        type:String,
        default:""
    },
    verify_email:{
        type:Boolean,
        default:false

    },
    lastActive:{
        type:Date,
        default:""
    },
    status:{
        type:String,
        enum:["Active","banned","suspended"],
        default:"Active"
    },
    address_details:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'address'
        }
    ],
    shopping_cart:[{
        type:mongoose.Schema.ObjectId,
        ref:'cartProduct'
    }],
     orderHistory:[{
        type:mongoose.Schema.ObjectId,
        ref:'orderHistory'
    }],
    forgot_password_otp:{
        type:String,
        default:null

    },
    forgot_password_expiry:{
        type:String,
        default:null
    },
    role:{
        type:String,
        enum:["ADMIN","USER"],
        default:"USER"
    },
    isBanned:{
        type:Boolean,
        default:false
    }
    

    
},{
    timestamps:true
})

const UserModel=mongoose.model("User",userSchema)

export default UserModel