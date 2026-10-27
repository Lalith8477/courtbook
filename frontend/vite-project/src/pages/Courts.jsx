import { useEffect, useState } from "react"
import axiosInstance, { getError } from "../axiosCalls/axios"
import { useToast } from "../context/ToastContext"
import CourtCard from "../components/CourtCard"
import SmartSearch from "../components/SmartSearch"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"
import { SPORTS } from "../utils/constants"
import { capitalize } from "../utils/format"

const emptyFilters = { search: "", sport: "", area: "", maxPrice: "" }

const Courts = () => {
    const { showToast } = useToast()
    const [courts, setCourts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [form, setForm] = useState(emptyFilters)
    const [filters, setFilters] = useState(emptyFilters)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setError("")
            try {
                const params = { page, limit: 9 }
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) {
                        params[key] = value
                    }
                })
                const res = await axiosInstance.get("/courts", { params })
                setCourts(res.data.courts)
                setPages(res.data.pages)
                setTotal(res.data.total)
            } catch (err) {
                setError(getError(err))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [filters, page])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleApply = (e) => {
        e.preventDefault()

        if (form.maxPrice && (isNaN(Number(form.maxPrice)) || Number(form.maxPrice) < 0)) {
            showToast("Max price must be a valid number", "error")
            return
        }

        setPage(1)
        setFilters({ ...form })
    }

    const handleReset = () => {
        setForm(emptyFilters)
        setPage(1)
        setFilters(emptyFilters)
    }

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Find a court</h1>

            <SmartSearch />

            <form
                onSubmit={handleApply}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
                <input
                    type="text"
                    name="search"
                    value={form.search}
                    onChange={handleChange}
                    placeholder="Search by name or place"
                    className={`${inputClass} lg:col-span-2`}
                />

                <select name="sport" value={form.sport} onChange={handleChange} className={inputClass}>
                    <option value="">All sports</option>
                    {SPORTS.map((sport) => (
                        <option key={sport} value={sport}>{capitalize(sport)}</option>
                    ))}
                </select>

                <input
                    type="text"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="Area"
                    className={inputClass}
                />

                <input
                    type="number"
                    name="maxPrice"
                    value={form.maxPrice}
                    onChange={handleChange}
                    placeholder="Max price per hour"
                    min="0"
                    className={inputClass}
                />

                <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
                    <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                        Apply filters
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Reset
                    </button>
                </div>
            </form>

            {loading && <Spinner text="Loading courts..." />}

            {!loading && error && (
                <EmptyState title="Could not load courts" message={error}>
                    <button
                        onClick={() => setFilters({ ...filters })}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        Try again
                    </button>
                </EmptyState>
            )}

            {!loading && !error && courts.length === 0 && (
                <EmptyState
                    title="No courts found"
                    message="Try changing or resetting your filters."
                />
            )}

            {!loading && !error && courts.length > 0 && (
                <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{total} court(s) found</p>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courts.map((court) => (
                            <CourtCard key={court._id} court={court} />
                        ))}
                    </div>

                    {pages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page <= 1}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm">Page {page} of {pages}</span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= pages}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Courts