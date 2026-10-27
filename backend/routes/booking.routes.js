import express from "express"
import {
    createBooking,
    getMyBookings,
    getOwnerBookings,
    getOwnerStats,
    cancelBooking,
    confirmBooking,
    rejectBooking,
    completeBooking
} from "../controllers/booking.controllers.js"
import { protect, allowRoles } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/", protect, allowRoles("player"), createBooking)
router.get("/mine", protect, allowRoles("player"), getMyBookings)
router.get("/owner", protect, allowRoles("owner"), getOwnerBookings)
router.get("/owner/stats", protect, allowRoles("owner"), getOwnerStats)
router.patch("/:id/cancel", protect, allowRoles("player"), cancelBooking)
router.patch("/:id/confirm", protect, allowRoles("owner"), confirmBooking)
router.patch("/:id/reject", protect, allowRoles("owner"), rejectBooking)
router.patch("/:id/complete", protect, allowRoles("owner"), completeBooking)

export default router