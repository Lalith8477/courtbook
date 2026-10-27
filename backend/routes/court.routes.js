import express from "express"
import {
    createCourt,
    getCourts,
    getMyCourts,
    getCourtById,
    getCourtSlots,
    updateCourt,
    deleteCourt
} from "../controllers/court.controllers.js"
import { protect, allowRoles } from "../middlewares/auth.middleware.js"
import upload from "../middlewares/upload.middleware.js"

const router = express.Router()

router.get("/", getCourts)
router.get("/mine", protect, allowRoles("owner"), getMyCourts)
router.post("/", protect, allowRoles("owner"), upload.array("images", 5), createCourt)
router.get("/:id", getCourtById)
router.get("/:id/slots", getCourtSlots)
router.put("/:id", protect, allowRoles("owner"), upload.array("images", 5), updateCourt)
router.delete("/:id", protect, allowRoles("owner"), deleteCourt)

export default router