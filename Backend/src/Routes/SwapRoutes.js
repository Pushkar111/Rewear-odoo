const express = require("express");
const router = express.Router();
const SwapController = require("../Controller/SwapController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// Create a new swap request - protected
router.post("/", authMiddleware.validateToken, SwapController.createSwapRequest);

// Get all swaps - protected
router.get("/", authMiddleware.validateToken, SwapController.getAllSwaps);

// Get user's swap history - protected (MOVE THIS BEFORE THE :id ROUTE)
router.get("/history", authMiddleware.validateToken, SwapController.getUserSwapHistory);

// Get user-specific swap history - protected
router.get("/history/:userId", authMiddleware.validateToken, SwapController.getUserSwapHistory);

// Get swap by ID - protected (KEEP THIS AFTER MORE SPECIFIC ROUTES)
router.get("/:id", authMiddleware.validateToken, SwapController.getSwapById);

// Update swap status - protected
router.put("/:id/status", authMiddleware.validateToken, SwapController.updateSwapStatus);

// Add rating to swap - protected
router.post("/:id/rate", authMiddleware.validateToken, SwapController.addSwapRating);

module.exports = router;