import apiClient from "./apiClient"

const swapService = {
    // Get all swaps with optional filters
    getAllSwaps: async(filters = {}) => {
        try {
            const response = await apiClient.get("/swaps", { params: filters });
            return response.data;
        } catch (error) {
            console.error("Error fetching swaps:", error);
            throw error;
        }
    },

    // Get swap by ID
    getSwapById: async(id) => {
        try {
            const response = await apiClient.get(`/swaps/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching swap ${id}:`, error);
            throw error;
        }
    },

    // Create a new swap request
    createSwap: async(swapData) => {
        try {
            const response = await apiClient.post("/swaps", swapData);
            return response.data;
        } catch (error) {
            console.error("Error creating swap:", error);
            throw error;
        }
    },

    // Update swap status (approved/completed/rejected)
    updateSwapStatus: async(id, status) => {
        try {
            const response = await apiClient.put(`/swaps/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error(`Error updating swap ${id} status:`, error);
            throw error;
        }
    },

    // Add rating to a completed swap
    rateSwap: async(id, rating, comment = '') => {
        try {
            const response = await apiClient.post(`/swaps/${id}/rate`, { rating, comment });
            return response.data;
        } catch (error) {
            console.error(`Error rating swap ${id}:`, error);
            throw error;
        }
    },

    // Get user's swap history
    getUserSwapHistory: async() => {
        try {
            const response = await apiClient.get('/swaps/history');
            return response.data;
        } catch (error) {
            console.error("Error fetching user swap history:", error);
            throw error;
        }
    }
};

export default swapService;