// import apiClient from "./apiClient"

// const itemService = {
//     // Get all items with optional filter parameters
//     getAllItems: async(params = {}) => {
//         try {
//             const response = await apiClient.get("/items", { params });
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching items:", error);
//             throw error;
//         }
//     },

//     // Get item by ID
//     getItemById: async(id) => {
//         try {
//             const response = await apiClient.get(`/items/${id}`);
//             return response.data;
//         } catch (error) {
//             console.error(`Error fetching item ${id}:`, error);
//             throw error;
//         }
//     },

//     // Create a new item
//     createItem: async(formData) => {
//         try {
//             // For file uploads, we need to use FormData
//             const itemFormData = new FormData();

//             // Add text fields
//             Object.keys(formData).forEach(key => {
//                 if (key !== 'images') {
//                     if (key === 'tags' && Array.isArray(formData[key])) {
//                         itemFormData.append(key, JSON.stringify(formData[key]));
//                     } else {
//                         itemFormData.append(key, formData[key]);
//                     }
//                 }
//             });

//             // Add image files
//             if (formData.images && formData.images.length) {
//                 formData.images.forEach(image => {
//                     itemFormData.append('images', image);
//                 });
//             }

//             const response = await apiClient.post("/items", itemFormData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error("Error creating item:", error);
//             throw error;
//         }
//     },

//     // Update an existing item
//     updateItem: async(id, formData) => {
//         try {
//             // For file uploads, we need to use FormData
//             const itemFormData = new FormData();

//             // Add text fields
//             Object.keys(formData).forEach(key => {
//                 if (key !== 'images') {
//                     if (key === 'tags' && Array.isArray(formData[key])) {
//                         itemFormData.append(key, JSON.stringify(formData[key]));
//                     } else {
//                         itemFormData.append(key, formData[key]);
//                     }
//                 }
//             });

//             // Add image files if there are any new ones
//             if (formData.images && formData.images.length) {
//                 formData.images.forEach(image => {
//                     itemFormData.append('images', image);
//                 });
//             }

//             const response = await apiClient.put(`/items/${id}`, itemFormData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             console.error(`Error updating item ${id}:`, error);
//             throw error;
//         }
//     },

//     // Delete an item
//     deleteItem: async(id) => {
//         try {
//             const response = await apiClient.delete(`/items/${id}`);
//             return response.data;
//         } catch (error) {
//             console.error(`Error deleting item ${id}:`, error);
//             throw error;
//         }
//     },

//     // Get items belonging to the logged-in user
//     getUserItems: async() => {
//         try {
//             const response = await apiClient.get('/items/user');
//             return response.data;
//         } catch (error) {
//             console.error("Error fetching user items:", error);
//             throw error;
//         }
//     },

//     // Like/unlike an item
//     toggleLike: async(id) => {
//         try {
//             const response = await apiClient.post(`/items/${id}/toggle-like`);
//             return response.data;
//         } catch (error) {
//             console.error(`Error toggling like for item ${id}:`, error);
//             throw error;
//         }
//     }
// };

// export default itemService;
import apiClient from "./apiClient";

const itemService = {
    // Get all items with optional filter parameters
    getAllItems: async (params = {}) => {
        try {
            const response = await apiClient.get("/items", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching items:", error);
            throw error;
        }
    },

    // Get item by ID
    getItemById: async (id) => {
        try {
            const response = await apiClient.get(`/items/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching item ${id}:`, error);
            throw error;
        }
    },

    // Create a new item
    createItem: async (formData) => {
        try {
            // For file uploads, we need to use FormData
            const itemFormData = new FormData();

            // Add text fields
            Object.keys(formData).forEach((key) => {
                if (key !== "images") {
                    if (key === "tags" && Array.isArray(formData[key])) {
                        itemFormData.append(key, JSON.stringify(formData[key]));
                    } else {
                        itemFormData.append(key, formData[key]);
                    }
                }
            });

            // Add image files
            if (formData.images && formData.images.length) {
                formData.images.forEach((image) => {
                    itemFormData.append("images", image);
                });
            }

            console.log("Creating item with URL:", `${apiClient.defaults.baseURL}/items`);

            const response = await apiClient.post("/items", itemFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error creating item:", error);
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
            throw error;
        }
    },

    // Update an existing item
    updateItem: async (id, formData) => {
        try {
            // For file uploads, we need to use FormData
            const itemFormData = new FormData();

            // Add text fields
            Object.keys(formData).forEach((key) => {
                if (key !== "images") {
                    if (key === "tags" && Array.isArray(formData[key])) {
                        itemFormData.append(key, JSON.stringify(formData[key]));
                    } else {
                        itemFormData.append(key, formData[key]);
                    }
                }
            });

            // Add image files if there are any new ones
            if (formData.images && formData.images.length) {
                formData.images.forEach((image) => {
                    itemFormData.append("images", image);
                });
            }

            const response = await apiClient.put(`/items/${id}`, itemFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating item ${id}:`, error);
            throw error;
        }
    },

    // Delete an item
    deleteItem: async (id) => {
        try {
            const response = await apiClient.delete(`/items/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting item ${id}:`, error);
            throw error;
        }
    },

    // Get items belonging to the logged-in user
    getUserItems: async (userId = null) => {
        try {
            let url = "/items/user";
            if (userId) {
                url = `/items/user/${userId}`;
            }

            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching user items:", error);
            throw error;
        }
    },

    // Like/unlike an item
    toggleLike: async (id) => {
        try {
            const response = await apiClient.post(`/items/${id}/toggle-like`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling like for item ${id}:`, error);
            throw error;
        }
    },
};

export default itemService;
