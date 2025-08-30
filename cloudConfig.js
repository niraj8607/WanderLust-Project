const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure the Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "wanderlust_DEV",
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

// Export the configured cloudinary and storage objects
module.exports = {
    cloudinary,
    storage
};