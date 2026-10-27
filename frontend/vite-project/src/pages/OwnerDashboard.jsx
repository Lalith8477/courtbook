import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import socket from "../socket"
import { useAuth } from "../context/AuthContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { RUPEE } from "../utils/format"

const OwnerDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const load = async (silent) => {
        if (!silent) {
            setLoading(true)
        }
        setError("")
        try {
            const res = await axiosInstance.get("/bookings/owner/stats")
            setStats(res.data)
        } catch (err) {
            setError(getError(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load(false)
    }, [])

    useEffect(() => {
        const refresh = () => load(true)
        socket.on("notification:new", refresh)
        return () => {
            socket.off("notification:new", refresh)
        }
    }, [])

    if (loading) {
        return <Spinner text="Loading dashboard..." />
    }

    if (error) {
        return (
            <EmptyState title="Could not load the dashboard" message={error}>
                <button
                    onClick={() => load(false)}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                >
                    Try again
                </button>
            </EmptyState>
        )
    }

    const cards = [
        { label: "My courts", value: stats.totalCourts, link: "/owner/courts" },
        { label: "Today's bookings", value: stats.todayBookings, link: "/owner/bookings" },
        { label: "Pending requests", value: stats.pendingBookings, link: "/owner/bookings?status=pending" },
        { label: "Total earnings", value: `${RUPEE}${stats.totalEarnings.toLocaleString("en-IN")}`, link: "/owner/bookings?status=confirmed" }
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Here is how your courts are doing.</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        to={card.link}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-emerald-500"
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                        <p className="text-3xl font-bold mt-1">{card.value}</p>
                    </Link>
                ))}
            </div>

            {stats.totalCourts === 0 && (
                <div className="mt-6">
                    <EmptyState title="You have no courts yet" message="Add your first court so players can start booking.">
                        <Link
                            to="/owner/courts/new"
                            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                        >
                            Add a court
                        </Link>
                    </EmptyState>
                </div>
            )}
        </div>
    )
}

export default OwnerDashboard