import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createEvent, getMyEvents, updateEventStatus, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();
router.use(protect);
router.post("/", createEvent);
router.get("/", getMyEvents);
router.patch("/:id", updateEventStatus);
router.delete("/:id", deleteEvent);

export default router;
