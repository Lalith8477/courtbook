export const RUPEE = "\u20B9"

export const todayIST = () => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())
}

export const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
    })
}

export const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number)
    const suffix = hours >= 12 ? "PM" : "AM"
    const hour = hours % 12 === 0 ? 12 : hours % 12
    return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`
}

export const capitalize = (text) => {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : ""
}