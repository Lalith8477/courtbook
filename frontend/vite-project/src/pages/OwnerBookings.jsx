import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import socket from "../socket"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { RUPEE, capitalize, formatDate, formatTime } from "../utils/format"
import { STATUS_TABS, statusStyles, hasStarted } from "../utils/booking"

const messages = {
    confirm: "Booking confirmed",
    reject: "Booking rejected",
    complete: "Booking marked as completed"
}

const OwnerBookings = () => {
    const [searchParams] = useSearchParams()
    const { theme } = useTheme()
    const { showToast } = useToast()
    const initialStatus = searchParams.get("status")

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [status, setStatus] = useState(STATUS_TABS.includes(initialStatus) ? initialStatus : "")
    const [date, setDate] = useState("")
    const [busyId, setBusyId] = useState("")

    const load = async (silent) => {
        if (!silent) {
            setLoading(true)
        }
        setError("")
        try {
            const params = {}
            if (status) {
                params.status = status
            }
            if (date) {
                params.date = date
            }
            const res = await axiosInstance.get("/bookings/owner", { params })
            setBookings(res.data.bookings)
        } catch (err) {
            setError(getError(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load(false)
    }, [status, date])

    useEffect(() => {
        const refresh = () => load(true)
        socket.on("notification:new", refresh)
        return () => {
            socket.off("notification:new", refresh)
        }
    }, [status, date])

    const handleAction = async (booking, action) => {
        setBusyId(booking._id)
        try {
            await axiosInstance.patch(`/bookings/${booking._id}/${action}`)
            showToast(messages[action], "success")
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
            <h1 className="text-2xl font-bold mb-4">Bookings for my courts</h1>

            <div className="flex flex-wrap items-center gap-2 mb-5">
                <button onClick={() => setStatus("")} className={tabClass("")}>All</button>
                {STATUS_TABS.map((tab) => (
                    <button key={tab} onClick={() => setStatus(tab)} className={tabClass(tab)}>
                        {capitalize(tab)}
                    </button>
                ))}

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
                    className="ml-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
                {date && (
                    <button onClick={() => setDate("")} className="text-xs underline text-gray-500 dark:text-gray-400">
                        Clear date
                    </button>
                )}
            </div>

            {loading && <Spinner text="Loading bookings..." />}

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
                <EmptyState title="No bookings found" message="Bookings for your courts will appear here." />
            )}

            {!loading && !error && bookings.length > 0 && (
                <div className="flex flex-col gap-3">
                    {bookings.map((b) => {
                        const canComplete = b.status === "confirmed" && hasStarted(b)
                        return (
                            <div
                                key={b._id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                            >
                                <div>
                                    <p className="font-semibold">{b.court ? b.court.name : "Court"}</p>
                                    <p className="text-sm mt-1">
                                        {formatDate(b.date)}, {formatTime(b.startTime)} - {formatTime(b.endTime)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {b.player ? `${b.player.name} (${b.player.email})` : "Player"}
                                    </p>
                                    <p className="text-sm font-medium">{RUPEE}{b.price}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[b.status]}`}>
                                        {capitalize(b.status)}
                                    </span>

                                    {b.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() => handleAction(b, "confirm")}
                                                disabled={busyId === b._id}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-60"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleAction(b, "reject")}
                                                disabled={busyId === b._id}
                                                className="px-4 py-1.5 rounded-lg border border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm disabled:opacity-60"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {canComplete && (
                                        <button
                                            onClick={() => handleAction(b, "complete")}
                                            disabled={busyId === b._id}
                                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
                                        >
                                            Mark completed
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

export default OwnerBookings