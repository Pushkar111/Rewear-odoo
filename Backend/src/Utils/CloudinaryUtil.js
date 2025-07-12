const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (userObject, filePath) => {
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
            // filename with name of user
            folder: `odoo-Rewear/users/${userObject._id}/profile-pics`,
            public_id: `odoo-Rewear/users/${userObject._id}/profile-pics/${userObject.name}`,
            resource_type: "image",
            overwrite: true,
        });

        console.log("Image uploaded to Cloudinary successfully : ", cloudinaryResponse.secure_url);

        return cloudinaryResponse;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);

        return null;
    }
};

const uploadMultipleFile = async (userObject, filePaths) => {
    try {
        const uploadPromises = filePaths.map((filePath, index) => {
            return cloudinary.uploader.upload(filePath, {
                folder: `odoo-Rewear/users/${userObject._id}/multiple-files`,
                public_id: `odoo-Rewear/users/${userObject._id}/multiple-files/${userObject.name}-${index + 1}`,
                resource_type: "image",
                overwrite: true,
            });
        });

        const cloudinaryResponses = await Promise.all(uploadPromises);
        
        console.log("Multiple files uploaded to Cloudinary successfully:", cloudinaryResponses);
        return cloudinaryResponses;
    } catch (error) {
        console.error("Error uploading multiple files to Cloudinary:", error);
        return null;
    }
};


// for Rewear odoo
const uploadToCloudinary = async (filePath, folder = "rewear") => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder
        });
        
        // Delete file from local server
        fs.unlinkSync(filePath);
        
        return result;
    } catch (error) {
        // Delete file from local server if upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

// Delete file from cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return { success: true };
    } catch (error) {
        throw error;
    }
};



module.exports = {
    uploadFile,
    uploadMultipleFile,
    uploadToCloudinary,
    deleteFromCloudinary
};
