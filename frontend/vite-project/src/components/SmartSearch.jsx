import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axiosInstance, { getError } from "../axiosCalls/axios"
import CourtCard from "./CourtCard"
import EmptyState from "./EmptyState"
import Spinner from "./Spinner"
import { RUPEE, capitalize, formatDate, formatTime } from "../utils/format"

const SmartSearch = () => {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)

    const handleSearch = async (e) => {
        e.preventDefault()

        if (!text.trim()) {
            showToast("Type what you are looking for", "error")
            return
        }

        setLoading(true)
        try {
            const res = await axiosInstance.post("/ai/smart-search", { text: text.trim() })
            setData(res.data)
        } catch (err) {
            setData(null)
            showToast(getError(err), "error")
        } finally {
            setLoading(false)
        }
    }

    const clearSearch = () => {
        setData(null)
        setText("")
    }

    const getChips = () => {
        const f = data.filters
        const chips = []
        if (f.sport) {
            chips.push(capitalize(f.sport))
        }
        chips.push(formatDate(f.date))
        if (f.startAfter !== "00:00") {
            chips.push(`After ${formatTime(f.startAfter)}`)
        }
        chips.push(`${f.durationHours} hr`)
        if (f.maxPrice) {
            chips.push(`Under ${RUPEE}${f.maxPrice}`)
        }
        if (f.area) {
            chips.push(f.area)
        }
        return chips
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
            <h2 className="font-semibold mb-1">Smart search</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Describe what you want, for example: football Saturday evening 2 hours under 2000
            </p>

            {!user ? (
                <p className="text-sm">
                    <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-medium">Login</Link> as a player to use smart search.
                </p>
            ) : (
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={200}
                        placeholder="What are you looking for?"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>
            )}

            {loading && <Spinner text="Finding free slots..." />}

            {data && !loading && (
                <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Searching for:</span>
                        {getChips().map((chip) => (
                            <span
                                key={chip}
                                className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            >
                                {chip}
                            </span>
                        ))}
                        <button onClick={clearSearch} className="text-xs underline text-gray-500 dark:text-gray-400 ml-2">
                            Clear
                        </button>
                    </div>

                    {data.results.length === 0 ? (
                        <EmptyState
                            title="No free slots match"
                            message="Try a different time, a higher budget or fewer hours."
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {data.results.map((item) => (
                                <CourtCard
                                    key={item.court._id}
                                    court={item.court}
                                    windows={item.windows}
                                    date={data.filters.date}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SmartSearch