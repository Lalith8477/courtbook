import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "./models/user.model.js"

let io

const parseCookie = (header = "") => {
    const cookies = {}
    header.split(";").forEach((part) => {
        const [key, ...rest] = part.trim().split("=")
        if (key) {
            cookies[key] = decodeURIComponent(rest.join("="))
        }
    })
    return cookies
}

export const initSocket = (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    })

    io.use(async (socket, next) => {
        try {
            const cookies = parseCookie(socket.handshake.headers.cookie)
            const token = cookies.token
            if (!token) {
                return next(new Error("Authentication required"))
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded.id).select("-password")
            if (!user) {
                return next(new Error("Authentication required"))
            }
            socket.user = user
            next()
        } catch (err) {
            next(new Error("Authentication required"))
        }
    })

    io.on("connection", (socket) => {
        socket.join(`user:${socket.user._id}`)
        console.log(`Socket connected: ${socket.user.name}`)

        socket.on("court:join", (courtId) => {
            if (mongoose.Types.ObjectId.isValid(courtId)) {
                socket.join(`court:${courtId}`)
            }
        })

        socket.on("court:leave", (courtId) => {
            socket.leave(`court:${courtId}`)
        })

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.user.name}`)
        })
    })

    return io
}

export const getIO = () => io