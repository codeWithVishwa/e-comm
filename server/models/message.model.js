import mongoose from 'mongoose'

const messageSchema=new mongoose.Schema({
   userId:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    name:{
        type:String,
        default:''
    },
    email:{
        type:String,
        default:''
    },
    subject:{
        type:String,
        default:''
    },
    message:{
        type:String,
        default:''
    },
    status:{
        type:String,
        enum:['unread','read','archived'],
        default:'unread'
    }

},{
    timestamps:true
})

const MessageModel=mongoose.model('message',messageSchema)

export default MessageModel