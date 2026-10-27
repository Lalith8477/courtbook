import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    isRead: { type: Boolean, default: false }
}, { timestamps: true })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification