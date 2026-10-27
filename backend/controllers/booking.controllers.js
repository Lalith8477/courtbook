import mongoose from "mongoose"
import Booking from "../models/booking.model.js"
import Court from "../models/court.model.js"
import { getSlotsForDate, isValidDate, getISTNow, toMinutes } from "../services/slotService.js"
import { notifyUser, emitSlotChange } from "../services/notificationService.js"

const hasStarted = (booking) => {
    const now = getISTNow()
    if (booking.date < now.date) {
        return true
    }
    if (booking.date === now.date && toMinutes(booking.startTime) <= now.minutes) {
        return true
    }
    return false
}

export const createBooking = async (req, res, next) => {
    try {
        const { courtId, date, startTime } = req.body

        if (!courtId || !date || !startTime) {
            return res.status(400).json({ message: "Court, date and start time are required" })
        }

        if (!mongoose.Types.ObjectId.isValid(courtId)) {
            return res.status(400).json({ message: "Invalid court id" })
        }

        if (!isValidDate(date)) {
            return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" })
        }

        if (date < getISTNow().date) {
            return res.status(400).json({ message: "You cannot book a past date" })
        }

        const court = await Court.findById(courtId)
        if (!court || !court.isActive) {
            return res.status(404).json({ message: "Court not found" })
        }

        const slots = await getSlotsForDate(court, date)
        const slot = slots.find((s) => s.startTime === startTime)

        if (!slot) {
            return res.status(400).json({ message: "This is not a valid slot for this court" })
        }

        if (slot.status === "past") {
            return res.status(400).json({ message: "This slot has already started" })
        }

        if (slot.status === "booked") {
            return res.status(409).json({ message: "This slot is already booked" })
        }

        const booking = await Booking.create({
            court: court._id,
            player: req.user._id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            price: slot.price
        })

        emitSlotChange(court._id, "slot:booked", {
            courtId: court._id,
            date,
            startTime: slot.startTime
        })

        await notifyUser(
            court.owner,
            "booking_new",
            `${req.user.name} booked ${court.name} on ${date} at ${slot.startTime}`,
            booking._id
        )

        res.status(201).json({ booking })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "This slot was just booked by someone else" })
        }
        next(err)
    }
}

export const getMyBookings = async (req, res, next) => {
    try {
        const filter = { player: req.user._id }
        if (req.query.status) {
            filter.status = req.query.status
        }

        const bookings = await Booking.find(filter)
            .populate("court", "name sport area city images")
            .sort({ date: -1, startTime: -1 })

        res.status(200).json({ bookings })
    } catch (err) {
        next(err)
    }
}

export const getOwnerBookings = async (req, res, next) => {
    try {
        const courts = await Court.find({ owner: req.user._id }).select("_id")
        const courtIds = courts.map((c) => c._id)

        const filter = { court: { $in: courtIds } }
        if (req.query.status) {
            filter.status = req.query.status
        }
        if (req.query.date) {
            filter.date = req.query.date
        }
        if (req.query.courtId && mongoose.Types.ObjectId.isValid(req.query.courtId)) {
            if (courtIds.some((id) => id.toString() === req.query.courtId)) {
                filter.court = req.query.courtId
            }
        }

        const bookings = await Booking.find(filter)
            .populate("court", "name sport area city")
            .populate("player", "name email")
            .sort({ date: -1, startTime: -1 })

        res.status(200).json({ bookings })
    } catch (err) {
        next(err)
    }
}

export const getOwnerStats = async (req, res, next) => {
    try {
        const courts = await Court.find({ owner: req.user._id }).select("_id")
        const courtIds = courts.map((c) => c._id)
        const today = getISTNow().date

        const todayBookings = await Booking.countDocuments({
            court: { $in: courtIds },
            date: today,
            status: { $in: ["pending", "confirmed"] }
        })

        const pendingBookings = await Booking.countDocuments({
            court: { $in: courtIds },
            status: "pending"
        })

        const earnings = await Booking.aggregate([
            { $match: { court: { $in: courtIds }, status: { $in: ["confirmed", "completed"] } } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ])

        res.status(200).json({
            totalCourts: courtIds.length,
            todayBookings,
            pendingBookings,
            totalEarnings: earnings.length > 0 ? earnings[0].total : 0
        })
    } catch (err) {
        next(err)
    }
}

export const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate("court")
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" })
        }

        if (booking.player.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only cancel your own bookings" })
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
            return res.status(400).json({ message: `A ${booking.status} booking cannot be cancelled` })
        }

        if (hasStarted(booking)) {
            return res.status(400).json({ message: "You cannot cancel a slot that has already started" })
        }

        booking.status = "cancelled"
        await booking.save()

        emitSlotChange(booking.court._id, "slot:released", {
            courtId: booking.court._id,
            date: booking.date,
            startTime: booking.startTime
        })

        await notifyUser(
            booking.court.owner,
            "booking_cancelled",
            `${req.user.name} cancelled the booking for ${booking.court.name} on ${booking.date} at ${booking.startTime}`,
            booking._id
        )

        res.status(200).json({ booking })
    } catch (err) {
        next(err)
    }
}

const ownerStatusChange = (allowedFrom, newStatus, mustHaveStarted) => {
    return async (req, res, next) => {
        try {
            const booking = await Booking.findById(req.params.id).populate("court")
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" })
            }

            if (booking.court.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "This booking is not for one of your courts" })
            }

            if (!allowedFrom.includes(booking.status)) {
                return res.status(400).json({ message: `A ${booking.status} booking cannot be changed to ${newStatus}` })
            }

            if (mustHaveStarted && !hasStarted(booking)) {
                return res.status(400).json({ message: "You can only complete a booking after its slot has started" })
            }

            if (!mustHaveStarted && newStatus === "confirmed" && hasStarted(booking)) {
                return res.status(400).json({ message: "This slot has already started" })
            }

            booking.status = newStatus
            await booking.save()

            if (newStatus === "rejected") {
                emitSlotChange(booking.court._id, "slot:released", {
                    courtId: booking.court._id,
                    date: booking.date,
                    startTime: booking.startTime
                })
            }

            await notifyUser(
                booking.player,
                `booking_${newStatus}`,
                `Your booking for ${booking.court.name} on ${booking.date} at ${booking.startTime} was ${newStatus}`,
                booking._id
            )

            res.status(200).json({ booking })
        } catch (err) {
            next(err)
        }
    }
}

export const confirmBooking = ownerStatusChange(["pending"], "confirmed", false)
export const rejectBooking = ownerStatusChange(["pending"], "rejected", false)
export const completeBooking = ownerStatusChange(["confirmed"], "completed", true)