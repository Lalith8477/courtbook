import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import socket from "../socket"
import { useToast } from "../context/ToastContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { RUPEE, capitalize, formatDate, formatTime } from "../utils/format"
import { STATUS_TABS, statusStyles, hasStarted } from "../utils/booking"

const MyBookings = () => {
    const { showToast } = useToast()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [status, setStatus] = useState("")
    const [busyId, setBusyId] = useState("")

    const load = async (silent) => {
        if (!silent) {
            setLoading(true)
        }
        setError("")
        try {
            const params = status ? { status } : {}
            const res = await axiosInstance.get("/bookings/mine", { params })
            setBookings(res.data.bookings)
        } catch (err) {
            setError(getError(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load(false)
    }, [status])

    useEffect(() => {
        const refresh = () => load(true)
        socket.on("notification:new", refresh)
        return () => {
            socket.off("notification:new", refresh)
        }
    }, [status])

    const handleCancel = async (booking) => {
        if (!window.confirm("Do you want to cancel this booking?")) {
            return
        }
        setBusyId(booking._id)
        try {
            await axiosInstance.patch(`/bookings/${booking._id}/cancel`)
            showToast("Booking cancelled", "success")
            load(true)
        } catch (err) {
            showToast(getError(err), "error")
        } finally {
            setBusyId("")
        }
    }

    const tabClass = (value) =>
        `px-4 py-1.5 rounded-full text-sm border ${
            status === value
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My bookings</h1>

            <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={() => setStatus("")} className={tabClass("")}>All</button>
                {STATUS_TABS.map((tab) => (
                    <button key={tab} onClick={() => setStatus(tab)} className={tabClass(tab)}>
                        {capitalize(tab)}
                    </button>
                ))}
            </div>

            {loading && <Spinner text="Loading your bookings..." />}

            {!loading && error && (
                <EmptyState title="Could not load bookings" message={error}>
                    <button
                        onClick={() => load(false)}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        Try again
                    </button>
                </EmptyState>
            )}

            {!loading && !error && bookings.length === 0 && (
                <EmptyState
                    title="No bookings here"
                    message={status ? "You have no bookings with this status." : "You have not booked any slot yet."}
                >
                    <Link to="/" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                        Find a court
                    </Link>
                </EmptyState>
            )}

            {!loading && !error && bookings.length > 0 && (
                <div className="flex flex-col gap-3">
                    {bookings.map((b) => {
                        const canCancel = ["pending", "confirmed"].includes(b.status) && !hasStarted(b)
                        return (
                            <div
                                key={b._id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div>
                                    {b.court ? (
                                        <Link to={`/courts/${b.court._id}`} className="font-semibold hover:underline">
                                            {b.court.name}
                                        </Link>
                                    ) : (
                                        <p className="font-semibold">Court no longer available</p>
                                    )}
                                    {b.court && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {capitalize(b.court.sport)} - {b.court.area}, {b.court.city}
                                        </p>
                                    )}
                                    <p className="text-sm mt-1">
                                        {formatDate(b.date)}, {formatTime(b.startTime)} - {formatTime(b.endTime)}
                                    </p>
                                    <p className="text-sm font-medium">{RUPEE}{b.price}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[b.status]}`}>
                                        {capitalize(b.status)}
                                    </span>
                                    {canCancel && (
                                        <button
                                            onClick={() => handleCancel(b)}
                                            disabled={busyId === b._id}
                                            className="px-3 py-1.5 rounded-lg border border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm disabled:opacity-60"
                                        >
                                            {busyId === b._id ? "Cancelling..." : "Cancel"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyBookings