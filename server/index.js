import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import uploadImageRouter from './route/uploadImage.route.js'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import MessageRouter from './route/message.route.js'
import Adminrouter from './route/adminuser.route.js'

dotenv.config()


const app=express()
app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(express.json())
app.use(helmet(
    {
        crossOriginResourcePolicy:false
    }
))

const PORT=8080 || process.env.PORT

app.get("/",(request,response)=>{
    response.json({
        message:"server is running "+PORT
    })
})
app.use('/api/v1/user',userRouter)
app.use("/api/v1/file",uploadImageRouter)
app.use("/api/v1/product",productRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/address",addressRouter)
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/message",MessageRouter)
app.use("/api/v1/admin",Adminrouter)


connectDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`server is running ${PORT}`)
})

})



