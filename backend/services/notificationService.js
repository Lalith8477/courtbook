import Notification from "../models/notification.model.js"
import { getIO } from "../socket.js"

export const notifyUser = async (userId, type, message, bookingId) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            message,
            booking: bookingId
        })
        const io = getIO()
        if (io) {
            io.to(`user:${userId}`).emit("notification:new", notification)
        }
    } catch (err) {
        console.log("Notification failed:", err.message)
    }
}

export const emitSlotChange = (courtId, event, data) => {
    const io = getIO()
    if (io) {
        io.to(`court:${courtId}`).emit(event, data)
    }
}