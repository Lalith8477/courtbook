import mongoose from "mongoose"
import { SPORTS } from "../utils/constants.js"

const courtSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    sport: { type: String, enum: SPORTS, required: true },
    description: { type: String, default: "" },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    images: [{ type: String }],
    pricePerHour: { type: Number, required: true, min: 0 },
    openTime: { type: String, default: "06:00" },
    closeTime: { type: String, default: "22:00" },
    slotDuration: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const Court = mongoose.model("Court", courtSchema)

export default Court