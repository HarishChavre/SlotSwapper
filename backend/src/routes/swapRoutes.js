import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getSwappableSlots, createSwapRequest, respondToSwap, getSwapRequests } from "../controllers/swapController.js";

const router = express.Router();
router.use(protect);
router.get("/swappable-slots", getSwappableSlots);
router.post("/swap-request", createSwapRequest);
router.post("/swap-response/:requestId", respondToSwap);
router.get("/requests", getSwapRequests);

export default router;
