import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "http"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"
import courtRoutes from "./routes/court.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import errorHandler from "./middlewares/errorHandler.js"
import { initSocket } from "./socket.js"

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 8084

app.set("trust proxy", 1)

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
].filter(Boolean)

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

initSocket(httpServer, allowedOrigins)

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" })
})

app.use("/auth", authRoutes)
app.use("/courts", courtRoutes)
app.use("/bookings", bookingRoutes)
app.use("/notifications", notificationRoutes)
app.use("/ai", aiRoutes)

app.use(errorHandler)

connectDB().then(() => {
    httpServer.listen(port, "0.0.0.0", () => {
        console.log(`Server Started at ${port}`)
    })
})