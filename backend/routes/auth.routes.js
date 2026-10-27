import express from "express"
import { register, login, logout, getMe, getSocketToken } from "../controllers/auth.controllers.js"
import { protect } from "../middlewares/auth.middleware.js"
import { authLimiter } from "../middlewares/rateLimit.js"

const router = express.Router()

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.post("/logout", logout)
router.get("/me", protect, getMe)
router.get("/socket-token", protect, getSocketToken)

export default router