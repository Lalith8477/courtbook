import express from "express"
import { smartSearch } from "../controllers/ai.controllers.js"
import { protect } from "../middlewares/auth.middleware.js"
import { aiLimiter } from "../middlewares/rateLimit.js"

const router = express.Router()

router.post("/smart-search", protect, aiLimiter, smartSearch)

export default router