import mongoose from 'mongoose'

const productSchema=new mongoose.Schema({
    name:{
        type:String,
       
    },
    image:{
        type:Array,
        default:['']
    },
    unit:{
        type:String,
        default:""
    },
    stock:{
        type:Number,
        default:null
    },
    price:{
        type:Number,
        default:null
    },
    discount:{
        type:Number,
        default:null
    },
    description:{
        type:String,
        default:""
    },
    rating:{
        type:Number,
        default:null
    },
    publish:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true
})

productSchema.index({
    name:"text",
    description:"text"
},{
    name:10,
    description:5
})

const ProductModel=mongoose.model('product',productSchema)

export default ProductModel