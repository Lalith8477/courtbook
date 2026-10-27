import mongoose from "mongoose"
import { BOOKING_STATUS } from "../utils/constants.js"

const bookingSchema = new mongoose.Schema({
    court: { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: BOOKING_STATUS, default: "pending" }
}, { timestamps: true })

bookingSchema.index(
    { court: 1, date: 1, startTime: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } }
)

const Booking = mongoose.model("Booking", bookingSchema)

export default Booking