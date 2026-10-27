import { useEffect, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import socket from "../socket"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { RUPEE, capitalize, formatDate, formatTime, todayIST } from "../utils/format"

const CourtDetails = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { theme } = useTheme()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [court, setCourt] = useState(null)
    const [courtLoading, setCourtLoading] = useState(true)
    const [courtError, setCourtError] = useState("")
    const [imageIndex, setImageIndex] = useState(0)

    const [date, setDate] = useState(() => {
        const fromLink = searchParams.get("date")
        const valid = fromLink && /^\d{4}-\d{2}-\d{2}$/.test(fromLink) && fromLink >= todayIST()
        return valid ? fromLink : todayIST()
    })
    const [slots, setSlots] = useState([])
    const [slotsLoading, setSlotsLoading] = useState(true)
    const [slotsError, setSlotsError] = useState("")
    const [selected, setSelected] = useState(null)
    const [booking, setBooking] = useState(false)

    useEffect(() => {
        const loadCourt = async () => {
            setCourtLoading(true)
            setCourtError("")
            try {
                const res = await axiosInstance.get(`/courts/${id}`)
                setCourt(res.data.court)
            } catch (err) {
                setCourtError(getError(err))
            } finally {
                setCourtLoading(false)
            }
        }
        loadCourt()
    }, [id])

    const fetchSlots = async (silent) => {
        if (!silent) {
            setSlotsLoading(true)
        }
        setSlotsError("")
        try {
            const res = await axiosInstance.get(`/courts/${id}/slots`, { params: { date } })
            setSlots(res.data.slots)
            setSelected((prev) => {
                if (!prev) {
                    return null
                }
                const stillFree = res.data.slots.some((s) => s.startTime === prev.startTime && s.status === "free")
                return stillFree ? prev : null
            })
        } catch (err) {
            setSlots([])
            setSlotsError(getError(err))
        } finally {
            setSlotsLoading(false)
        }
    }

    useEffect(() => {
        setSelected(null)
        fetchSlots(false)
    }, [id, date])

    useEffect(() => {
        const join = () => socket.emit("court:join", id)
        if (socket.connected) {
            join()
        }
        socket.on("connect", join)
        return () => {
            socket.off("connect", join)
            socket.emit("court:leave", id)
        }
    }, [id])

    useEffect(() => {
        const refresh = (data) => {
            if (String(data.courtId) === id && data.date === date) {
                fetchSlots(true)
            }
        }
        socket.on("slot:booked", refresh)
        socket.on("slot:released", refresh)
        return () => {
            socket.off("slot:booked", refresh)
            socket.off("slot:released", refresh)
        }
    }, [id, date])

    const handleBook = async () => {
        if (!user) {
            showToast("Please login to book a slot", "info")
            navigate("/login")
            return
        }

        if (user.role !== "player") {
            showToast("Only players can book slots", "error")
            return
        }

        setBooking(true)
        try {
            await axiosInstance.post("/bookings", { courtId: id, date, startTime: selected.startTime })
            showToast("Booking requested. The owner will confirm it soon", "success")
            setSelected(null)
        } catch (err) {
            showToast(getError(err), "error")
        } finally {
            setBooking(false)
            fetchSlots(true)
        }
    }

    const slotClass = (slot) => {
        const isSelected = selected && selected.startTime === slot.startTime
        if (slot.status === "booked") {
            return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 cursor-not-allowed"
        }
        if (slot.status === "past") {
            return "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 cursor-not-allowed"
        }
        if (isSelected) {
            return "bg-emerald-600 text-white border-emerald-600"
        }
        return "bg-white dark:bg-gray-800 border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-gray-700"
    }

    if (courtLoading) {
        return <Spinner text="Loading court..." />
    }

    if (courtError || !court) {
        return (
            <EmptyState title="Court not found" message={courtError || "This court does not exist."}>
                <Link to="/" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                    Back to courts
                </Link>
            </EmptyState>
        )
    }

    return (
        <div>
            <Link to="/" className="text-sm text-emerald-600 dark:text-emerald-400">Back to courts</Link>

            <div className="grid gap-6 lg:grid-cols-2 mt-3">
                <div>
                    {court.images && court.images.length > 0 ? (
                        <>
                            <img
                                src={court.images[imageIndex]}
                                alt={court.name}
                                className="w-full h-72 object-cover rounded-xl"
                            />
                            {court.images.length > 1 && (
                                <div className="flex gap-2 mt-2">
                                    {court.images.map((image, index) => (
                                        <img
                                            key={image}
                                            src={image}
                                            alt=""
                                            onClick={() => setImageIndex(index)}
                                            className={`h-16 w-20 object-cover rounded-lg cursor-pointer border-2 ${index === imageIndex ? "border-emerald-600" : "border-transparent"}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-72 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No photo
                        </div>
                    )}

                    <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <div className="flex items-start justify-between gap-2">
                            <h1 className="text-2xl font-bold">{court.name}</h1>
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                {capitalize(court.sport)}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {court.address ? `${court.address}, ` : ""}{court.area}, {court.city}
                        </p>
                        {court.description && <p className="mt-3 text-sm">{court.description}</p>}

                        <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                                <dd className="font-medium">{RUPEE}{court.pricePerHour} / hour</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Open</dt>
                                <dd className="font-medium">{formatTime(court.openTime)} - {formatTime(court.closeTime)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Slot length</dt>
                                <dd className="font-medium">{court.slotDuration} minutes</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Owner</dt>
                                <dd className="font-medium">{court.owner ? court.owner.name : "Not available"}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 h-fit">
                    <h2 className="text-lg font-semibold mb-3">Choose a slot</h2>

                    <input
                        type="date"
                        value={date}
                        min={todayIST()}
                        onChange={(e) => e.target.value && setDate(e.target.value)}
                        style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatDate(date)}</p>

                    <div className="flex flex-wrap gap-3 text-xs mt-3 mb-4">
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-emerald-500"></span>Free</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-200 dark:bg-red-900/60"></span>Booked</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700"></span>Passed</span>
                        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-600"></span>Selected</span>
                    </div>

                    {slotsLoading && <Spinner text="Loading slots..." />}

                    {!slotsLoading && slotsError && (
                        <EmptyState title="Could not load slots" message={slotsError}>
                            <button
                                onClick={() => fetchSlots(false)}
                                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                            >
                                Try again
                            </button>
                        </EmptyState>
                    )}

                    {!slotsLoading && !slotsError && slots.length === 0 && (
                        <EmptyState title="No slots" message="This court has no slots on this day." />
                    )}

                    {!slotsLoading && !slotsError && slots.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {slots.map((slot) => (
                                <button
                                    key={slot.startTime}
                                    disabled={slot.status !== "free"}
                                    onClick={() => setSelected(slot)}
                                    className={`border rounded-lg py-2 px-1 text-sm ${slotClass(slot)}`}
                                >
                                    <div className="font-medium">{formatTime(slot.startTime)}</div>
                                    <div className="text-xs">
                                        {slot.status === "free" ? `${RUPEE}${slot.price}` : slot.status === "booked" ? "Booked" : "Passed"}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {user && user.role === "owner" && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            You are logged in as an owner. Use a player account to book slots.
                        </p>
                    )}

                    {selected && (
                        <div className="mt-5 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-sm">
                                {formatDate(date)}, {formatTime(selected.startTime)} - {formatTime(selected.endTime)}
                            </p>
                            <p className="font-semibold mb-3">{RUPEE}{selected.price}</p>
                            <button
                                onClick={handleBook}
                                disabled={booking}
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {booking ? "Booking..." : user ? "Confirm booking" : "Login to book"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourtDetails