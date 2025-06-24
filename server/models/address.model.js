import mongoose from 'mongoose'

const addressSchema=new mongoose.Schema({
    name:{
        type:String,
        default:""

    },
    address_line:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
 },
    pincode:{
        type:String,
        default:""
    },
    country:{
        type:String,
        default:"India"
    },
    mobile:{
        type:String,
        default:''
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        default:""
    }

},{
    timestamps:true
})

const AddressModel=mongoose.model('address',addressSchema)

export default AddressModel