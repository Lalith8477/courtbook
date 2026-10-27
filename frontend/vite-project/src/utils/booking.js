export const STATUS_TABS = ["pending", "confirmed", "completed", "cancelled", "rejected"]

export const statusStyles = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    cancelled: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
}

export const nowIST = () => {
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

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute"))
    }
}

export const hasStarted = (booking) => {
    const now = nowIST()
    if (booking.date < now.date) {
        return true
    }
    if (booking.date === now.date) {
        const [hours, minutes] = booking.startTime.split(":").map(Number)
        return hours * 60 + minutes <= now.minutes
    }
    return false
}