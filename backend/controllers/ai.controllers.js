import Court from "../models/court.model.js"
import { SPORTS } from "../utils/constants.js"
import { parseSearchText } from "../services/geminiService.js"
import { getSlotsForDate, isValidDate, getISTNow } from "../services/slotService.js"

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const cleanFilters = (input) => {
    const raw = input && typeof input === "object" && !Array.isArray(input) ? input : {}
    const today = getISTNow().date
    const duration = Number(raw.durationHours)
    const price = Number(raw.maxPrice)

    return {
        sport: SPORTS.includes(raw.sport) ? raw.sport : null,
        date: isValidDate(raw.date) && raw.date >= today ? raw.date : today,
        startAfter: timePattern.test(raw.startAfter) ? raw.startAfter : "00:00",
        durationHours: duration >= 0.5 && duration <= 4 ? duration : 1,
        maxPrice: raw.maxPrice !== null && raw.maxPrice !== undefined && price > 0 ? price : null,
        area: typeof raw.area === "string" && raw.area.trim() ? raw.area.trim().slice(0, 50) : null
    }
}

const findWindows = (slots, filters, slotsNeeded) => {
    const windows = []

    for (let i = 0; i + slotsNeeded <= slots.length; i++) {
        const group = slots.slice(i, i + slotsNeeded)

        if (group[0].startTime < filters.startAfter) {
            continue
        }

        if (!group.every((s) => s.status === "free")) {
            continue
        }

        const price = group.reduce((sum, s) => sum + s.price, 0)
        if (filters.maxPrice && price > filters.maxPrice) {
            continue
        }

        windows.push({
            startTime: group[0].startTime,
            endTime: group[slotsNeeded - 1].endTime,
            price
        })
    }

    return windows
}

export const smartSearch = async (req, res, next) => {
    try {
        const { text } = req.body

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({ message: "Please type what you are looking for" })
        }

        if (text.length > 200) {
            return res.status(400).json({ message: "Search text must be under 200 characters" })
        }

        const parsed = await parseSearchText(text.trim())
        const filters = cleanFilters(parsed)

        const query = { isActive: true }
        if (filters.sport) {
            query.sport = filters.sport
        }
        if (filters.area) {
            const pattern = new RegExp(escapeRegex(filters.area), "i")
            query.$or = [{ area: pattern }, { city: pattern }]
        }

        const courts = await Court.find(query).limit(30)

        const checked = await Promise.all(
            courts.map(async (court) => {
                const slots = await getSlotsForDate(court, filters.date)
                const slotsNeeded = Math.ceil((filters.durationHours * 60) / court.slotDuration)
                const windows = findWindows(slots, filters, slotsNeeded)
                return { court, windows: windows.slice(0, 6) }
            })
        )

        const results = checked.filter((item) => item.windows.length > 0)

        res.status(200).json({ filters, results })
    } catch (err) {
        next(err)
    }
}