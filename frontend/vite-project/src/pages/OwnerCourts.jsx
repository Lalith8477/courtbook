import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axiosInstance, { getError } from "../axiosCalls/axios"
import { useToast } from "../context/ToastContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { RUPEE, capitalize } from "../utils/format"

const OwnerCourts = () => {
    const { showToast } = useToast()
    const [courts, setCourts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [busyId, setBusyId] = useState("")

    const load = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await axiosInstance.get("/courts/mine")
            setCourts(res.data.courts)
        } catch (err) {
            setError(getError(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleDelete = async (court) => {
        if (!window.confirm(`Delete ${court.name}? This cannot be undone.`)) {
            return
        }
        setBusyId(court._id)
        try {
            await axiosInstance.delete(`/courts/${court._id}`)
            setCourts((prev) => prev.filter((c) => c._id !== court._id))
            showToast("Court deleted", "success")
        } catch (err) {
            showToast(getError(err), "error")
        } finally {
            setBusyId("")
        }
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h1 className="text-2xl font-bold">My courts</h1>
                <Link
                    to="/owner/courts/new"
                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                >
                    Add a court
                </Link>
            </div>

            {loading && <Spinner text="Loading your courts..." />}

            {!loading && error && (
                <EmptyState title="Could not load your courts" message={error}>
                    <button
                        onClick={load}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        Try again
                    </button>
                </EmptyState>
            )}

            {!loading && !error && courts.length === 0 && (
                <EmptyState title="No courts yet" message="Add your first court so players can book it.">
                    <Link
                        to="/owner/courts/new"
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        Add a court
                    </Link>
                </EmptyState>
            )}

            {!loading && !error && courts.length > 0 && (
                <div className="flex flex-col gap-3">
                    {courts.map((court) => (
                        <div
                            key={court._id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                            {court.images && court.images.length > 0 ? (
                                <img src={court.images[0]} alt={court.name} className="h-20 w-28 object-cover rounded-lg" />
                            ) : (
                                <div className="h-20 w-28 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                                    No photo
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link to={`/courts/${court._id}`} className="font-semibold hover:underline">
                                        {court.name}
                                    </Link>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        {capitalize(court.sport)}
                                    </span>
                                    {!court.isActive && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{court.area}, {court.city}</p>
                                <p className="text-sm font-medium">{RUPEE}{court.pricePerHour} / hour</p>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/owner/courts/${court._id}/edit`}
                                    className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(court)}
                                    disabled={busyId === court._id}
                                    className="px-4 py-1.5 rounded-lg border border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm disabled:opacity-60"
                                >
                                    {busyId === court._id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default OwnerCourts