import {Router} from 'express'
import auth from '../middleware/auth.js';
import uploadImageController from '../controllers/uploadImage.controller.js';
import upload from '../middleware/multer.js';

const uploadImageRouter=Router()

uploadImageRouter.post("/upload",auth,upload.single("image"),uploadImageController)

export default uploadImageRouter