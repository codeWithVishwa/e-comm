import {Router} from 'express'
import auth from '../middleware/auth.js'
import { createProductController, deleteProductController, getProductController, getSingleProduct, updateProductController } from '../controllers/product.controller.js'
import { adminCheck } from '../middleware/admin.auth.js'

const productRouter=Router()

productRouter.post("/create",auth,adminCheck,createProductController)
productRouter.post("/get",getProductController)
productRouter.put("/:productId",updateProductController)
productRouter.put("/single/:productId",getSingleProduct)
productRouter.delete("/:productId",auth,adminCheck,deleteProductController)
export default productRouter