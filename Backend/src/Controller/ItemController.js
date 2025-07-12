const ItemModel = require("../Model/ItemModel");
const { uploadToCloudinary, deleteFromCloudinary } = require("../Utils/CloudinaryUtil");
const LikeModel = require("../Model/LikeModel");
// createItem
// getAllItems
// getItemById
// updateItem
// deleteItem
// getUserItems
// toggleLike

const ItemController = {
    // Create a new item

    createItem: async (req, res) => {
        try {
            const { title, description, category, size, condition, brand, color } = req.body;
            let tags = [];

            // Parse tags if they're provided as a string
            if (req.body.tags) {
                try {
                    tags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags;
                } catch (e) {
                    console.error("Error parsing tags:", e);
                }
            }

            // Validate required fields
            if (!title || !description || !category || !size || !condition) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }

            // Process uploaded images
            const images = [];
            if (req.files && req.files.length > 0) {
                // Upload images to Cloudinary
                const uploadPromises = req.files.map((file) => uploadToCloudinary(file.path, "items"));
                const uploadedImages = await Promise.all(uploadPromises);

                images.push(
                    ...uploadedImages.map((img) => ({
                        url: img.secure_url,
                        public_id: img.public_id,
                    }))
                );
            }

            // Create new item
            const newItem = new ItemModel({
                title,
                description,
                category,
                size,
                condition,
                brand: brand || "",
                color: color || "",
                tags,
                images,
                owner: req.user.id,
            });

            await newItem.save();

            res.status(201).json({
                success: true,
                message: "Item created successfully",
                data: newItem,
            });
        } catch (error) {
            console.error("Error creating item:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create item",
                error: error.message,
            });
        }
    },

    // Get all items with filters
    getAllItems: async (req, res) => {
        try {
            const { category, size, searchTerm, status } = req.query;
            const filter = {};

            // Apply filters
            if (category && category !== "all") {
                filter.category = category;
            }
            if (size && size !== "all") {
                filter.size = size;
            }
            if (status && status !== "all") {
                filter.status = status;
            }
            if (searchTerm) {
                filter.$or = [{ title: { $regex: searchTerm, $options: "i" } }, { description: { $regex: searchTerm, $options: "i" } }, { tags: { $in: [new RegExp(searchTerm, "i")] } }];
            }

            // Only show active items to general users
            if (!req.query.includeAll) {
                filter.status = "active";
            }

            const items = await ItemModel.find(filter)
                .populate({
                    path: "owner",
                    select: "name profilePic location",
                })
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: items.length,
                data: items,
            });
        } catch (error) {
            console.error("Error fetching items:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch items",
                error: error.message,
            });
        }
    },

    // Get item by ID
    getItemById: async (req, res) => {
        try {
            const item = await ItemModel.findById(req.params.id).populate({
                path: "owner",
                select: "name profilePic location rating",
            });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            // Increment views
            item.views += 1;
            await item.save();

            res.status(200).json({
                success: true,
                data: item,
            });
        } catch (error) {
            console.error("Error fetching item:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch item",
                error: error.message,
            });
        }
    },

    // Update item
    updateItem: async (req, res) => {
        try {
            const { title, description, category, size, condition, brand, color, tags, status } = req.body;

            // Find item and check ownership
            const item = await ItemModel.findById(req.params.id);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            // Check if user is owner or admin
            if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            // Update fields
            const updateData = {
                title: title || item.title,
                description: description || item.description,
                category: category || item.category,
                size: size || item.size,
                condition: condition || item.condition,
                brand: brand || item.brand,
                color: color || item.color,
                tags: tags ? JSON.parse(tags) : item.tags,
                status: status || item.status,
            };

            // Handle new images if uploaded
            if (req.files && req.files.length > 0) {
                // Delete old images from cloudinary
                const deletePromises = item.images.map((img) => deleteFromCloudinary(img.public_id));
                await Promise.all(deletePromises);

                // Upload new images
                const uploadPromises = req.files.map((file) => uploadToCloudinary(file.path, "items"));
                const uploadedImages = await Promise.all(uploadPromises);

                updateData.images = uploadedImages.map((img) => ({
                    url: img.secure_url,
                    public_id: img.public_id,
                }));
            }

            // Update item
            const updatedItem = await ItemModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

            res.status(200).json({
                success: true,
                message: "Item updated successfully",
                data: updatedItem,
            });
        } catch (error) {
            console.error("Error updating item:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update item",
                error: error.message,
            });
        }
    },

    // Delete item
    deleteItem: async (req, res) => {
        try {
            // Find item and check ownership
            const item = await ItemModel.findById(req.params.id);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            // Check if user is owner or admin
            if (item.owner.toString() !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            // Delete images from cloudinary
            const deletePromises = item.images.map((img) => deleteFromCloudinary(img.public_id));
            await Promise.all(deletePromises);

            // Delete item
            await ItemModel.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: "Item deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting item:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete item",
                error: error.message,
            });
        }
    },

    // Get user's items
    getUserItems: async (req, res) => {
        try {
            // If userId is provided in params, use that, otherwise use the authenticated user's ID
            const userId = req.params.userId || req.user.id;

            const items = await ItemModel.find({ owner: userId }).sort({ createdAt: -1 }).populate("owner", "name profilePic");

            return res.status(200).json({
                success: true,
                items,
                count: items.length,
            });
        } catch (error) {
            console.error("Error in getUserItems:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch user items",
                error: error.message,
            });
        }
    },

    // Toggle like on item
    toggleLike: async (req, res) => {
        try {
            const item = await ItemModel.findById(req.params.id);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            // Check if user has already liked the item
            const userId = req.user.id;
            const isLiked = await LikeModel.findOne({
                item: req.params.id,
                user: userId,
            });

            if (isLiked) {
                // Unlike
                await LikeModel.findByIdAndDelete(isLiked._id);
                item.likes -= 1;
                await item.save();

                return res.status(200).json({
                    success: true,
                    message: "Item unliked successfully",
                    isLiked: false,
                    likes: item.likes,
                });
            } else {
                // Like
                const newLike = new LikeModel({
                    item: req.params.id,
                    user: userId,
                });
                await newLike.save();

                item.likes += 1;
                await item.save();

                return res.status(200).json({
                    success: true,
                    message: "Item liked successfully",
                    isLiked: true,
                    likes: item.likes,
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            res.status(500).json({
                success: false,
                message: "Failed to toggle like",
                error: error.message,
            });
        }
    },
};

module.exports = ItemController;
