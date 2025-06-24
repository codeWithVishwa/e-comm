import uploadImageCloudiary from "../utils/uploadImageCloudiary.js";

const uploadImageController = async (request, response) => {
  try {
    // 1. Validate request has file
    if (!request.file) {
      return response.status(400).json({
        message: "No file uploaded",
        error: true,
        success: false
      });
    }

    // 2. Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(request.file.mimetype)) {
      return response.status(400).json({
        message: "Only JPG, PNG, and WEBP files are allowed",
        error: true,
        success: false
      });
    }

    // 3. Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (request.file.size > maxSize) {
      return response.status(400).json({
        message: "File size exceeds 5MB limit",
        error: true,
        success: false
      });
    }

    // 4. Upload to Cloudinary
    const uploadResult = await uploadImageCloudiary(request.file);

    // 5. Validate Cloudinary response
    if (!uploadResult.secure_url) {
      throw new Error("Cloudinary upload failed - no secure URL returned");
    }

    // 6. Success response
    return response.json({
      message: "Upload successful",
      error: false,
      success: true,
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    
    // Determine appropriate status code
    const statusCode = error.message.includes("Cloudinary") ? 502 : 500;
    
    return response.status(statusCode).json({
      message: error.message || "Internal server error",
      error: true,
      success: false
    });
  }
};

export default uploadImageController;