import Court from "../models/court.model.js"
import Booking from "../models/booking.model.js"
import { SPORTS } from "../utils/constants.js"
import { uploadImages } from "../utils/uploadToCloudinary.js"
import { getSlotsForDate, isValidDate, getISTNow, toMinutes } from "../services/slotService.js"

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const validateCourt = (data) => {
    const { name, sport, area, city, pricePerHour, openTime, closeTime, slotDuration } = data

    if (!name || !name.trim()) {
        return "Court name is required"
    }
    if (!SPORTS.includes(sport)) {
        return `Sport must be one of: ${SPORTS.join(", ")}`
    }
    if (!area || !area.trim()) {
        return "Area is required"
    }
    if (!city || !city.trim()) {
        return "City is required"
    }
    if (isNaN(pricePerHour) || pricePerHour < 0) {
        return "Price per hour must be a valid number"
    }
    if (!timePattern.test(openTime) || !timePattern.test(closeTime)) {
        return "Opening and closing time must be in HH:MM format"
    }
    if (toMinutes(openTime) >= toMinutes(closeTime)) {
        return "Closing time must be after opening time"
    }
    if (isNaN(slotDuration) || slotDuration < 30 || slotDuration > 180) {
        return "Slot duration must be between 30 and 180 minutes"
    }
    if (toMinutes(closeTime) - toMinutes(openTime) < slotDuration) {
        return "Opening hours are shorter than one slot"
    }
    return null
}

export const createCourt = async (req, res, next) => {
    try {
        const { name, sport, description, area, city, address } = req.body
        const pricePerHour = Number(req.body.pricePerHour)
        const openTime = req.body.openTime || "06:00"
        const closeTime = req.body.closeTime || "22:00"
        const slotDuration = Number(req.body.slotDuration) || 60

        const error = validateCourt({ name, sport, area, city, pricePerHour, openTime, closeTime, slotDuration })
        if (error) {
            return res.status(400).json({ message: error })
        }

        const images = await uploadImages(req.files)

        const court = await Court.create({
            owner: req.user._id,
            name: name.trim(),
            sport,
            description: description || "",
            area: area.trim(),
            city: city.trim(),
            address: address || "",
            images,
            pricePerHour,
            openTime,
            closeTime,
            slotDuration
        })

        res.status(201).json({ court })
    } catch (err) {
        next(err)
    }
}

export const getCourts = async (req, res, next) => {
    try {
        const { sport, area, city, maxPrice, minPrice, search } = req.query
        const page = Math.max(Number(req.query.page) || 1, 1)
        const limit = Math.min(Number(req.query.limit) || 12, 50)
        const filter = { isActive: true }

        if (sport) {
            if (!SPORTS.includes(sport)) {
                return res.status(400).json({ message: "Invalid sport" })
            }
            filter.sport = sport
        }

        if (area) {
            filter.area = new RegExp(escapeRegex(area), "i")
        }

        if (city) {
            filter.city = new RegExp(escapeRegex(city), "i")
        }

        if (maxPrice || minPrice) {
            filter.pricePerHour = {}
            if (maxPrice) {
                if (isNaN(Number(maxPrice))) {
                    return res.status(400).json({ message: "Max price must be a number" })
                }
                filter.pricePerHour.$lte = Number(maxPrice)
            }
            if (minPrice) {
                if (isNaN(Number(minPrice))) {
                    return res.status(400).json({ message: "Min price must be a number" })
                }
                filter.pricePerHour.$gte = Number(minPrice)
            }
        }

        if (search) {
            const pattern = new RegExp(escapeRegex(search), "i")
            filter.$or = [{ name: pattern }, { area: pattern }, { city: pattern }]
        }

        const total = await Court.countDocuments(filter)
        const courts = await Court.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        res.status(200).json({ courts, total, page, pages: Math.ceil(total / limit) })
    } catch (err) {
        next(err)
    }
}

export const getMyCourts = async (req, res, next) => {
    try {
        const courts = await Court.find({ owner: req.user._id }).sort({ createdAt: -1 })
        res.status(200).json({ courts })
    } catch (err) {
        next(err)
    }
}

export const getCourtById = async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id).populate("owner", "name")
        if (!court) {
            return res.status(404).json({ message: "Court not found" })
        }
        res.status(200).json({ court })
    } catch (err) {
        next(err)
    }
}

export const getCourtSlots = async (req, res, next) => {
    try {
        const { date } = req.query

        if (!date || !isValidDate(date)) {
            return res.status(400).json({ message: "Please provide a valid date as YYYY-MM-DD" })
        }

        if (date < getISTNow().date) {
            return res.status(400).json({ message: "You cannot view slots for a past date" })
        }

        const court = await Court.findById(req.params.id)
        if (!court || !court.isActive) {
            return res.status(404).json({ message: "Court not found" })
        }

        const slots = await getSlotsForDate(court, date)
        res.status(200).json({ date, slots })
    } catch (err) {
        next(err)
    }
}

export const updateCourt = async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id)
        if (!court) {
            return res.status(404).json({ message: "Court not found" })
        }

        if (court.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only edit your own courts" })
        }

        const updated = {
            name: req.body.name ?? court.name,
            sport: req.body.sport ?? court.sport,
            description: req.body.description ?? court.description,
            area: req.body.area ?? court.area,
            city: req.body.city ?? court.city,
            address: req.body.address ?? court.address,
            pricePerHour: req.body.pricePerHour !== undefined ? Number(req.body.pricePerHour) : court.pricePerHour,
            openTime: req.body.openTime ?? court.openTime,
            closeTime: req.body.closeTime ?? court.closeTime,
            slotDuration: req.body.slotDuration !== undefined ? Number(req.body.slotDuration) : court.slotDuration
        }

        const error = validateCourt(updated)
        if (error) {
            return res.status(400).json({ message: error })
        }

        const newImages = await uploadImages(req.files)
        const allImages = [...court.images, ...newImages]
        if (allImages.length > 5) {
            return res.status(400).json({ message: "A court can have at most 5 images" })
        }

        court.set(updated)
        court.images = allImages

        if (req.body.isActive !== undefined) {
            court.isActive = req.body.isActive === "true" || req.body.isActive === true
        }

        await court.save()
        res.status(200).json({ court })
    } catch (err) {
        next(err)
    }
}

export const deleteCourt = async (req, res, next) => {
    try {
        const court = await Court.findById(req.params.id)
        if (!court) {
            return res.status(404).json({ message: "Court not found" })
        }

        if (court.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own courts" })
        }

        const upcoming = await Booking.countDocuments({
            court: court._id,
            date: { $gte: getISTNow().date },
            status: { $in: ["pending", "confirmed"] }
        })

        if (upcoming > 0) {
            return res.status(409).json({ message: "This court has upcoming bookings. Cancel or reject them first" })
        }

        await court.deleteOne()
        res.status(200).json({ message: "Court deleted successfully" })
    } catch (err) {
        next(err)
    }
}