import Booking from "../models/booking.model.js"

export const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
}

export const toTime = (totalMinutes) => {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0")
    const minutes = String(totalMinutes % 60).padStart(2, "0")
    return `${hours}:${minutes}`
}

export const getISTNow = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).formatToParts(new Date())

    const get = (type) => parts.find((p) => p.type === type).value
    const hour = Number(get("hour")) % 24

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        minutes: hour * 60 + Number(get("minute"))
    }
}

export const isValidDate = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false
    }
    const parsed = new Date(`${date}T00:00:00Z`)
    if (isNaN(parsed.getTime())) {
        return false
    }
    return parsed.toISOString().slice(0, 10) === date
}

export const getSlotsForDate = async (court, date) => {
    const booked = await Booking.find({
        court: court._id,
        date,
        status: { $in: ["pending", "confirmed"] }
    }).select("startTime")

    const bookedTimes = booked.map((b) => b.startTime)
    const now = getISTNow()
    const start = toMinutes(court.openTime)
    const end = toMinutes(court.closeTime)
    const price = Math.round((court.pricePerHour * court.slotDuration) / 60)
    const slots = []

    for (let t = start; t + court.slotDuration <= end; t += court.slotDuration) {
        const startTime = toTime(t)
        let status = "free"

        if (bookedTimes.includes(startTime)) {
            status = "booked"
        } else if (date === now.date && t <= now.minutes) {
            status = "past"
        }

        slots.push({
            startTime,
            endTime: toTime(t + court.slotDuration),
            price,
            status
        })
    }

    return slots
}