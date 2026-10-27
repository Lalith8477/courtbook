import { Link } from "react-router-dom"
import { RUPEE, capitalize, formatTime } from "../utils/format"

const CourtCard = ({ court, windows, date }) => {
    const link = date ? `/courts/${court._id}?date=${date}` : `/courts/${court._id}`

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <Link to={link}>
                {court.images && court.images.length > 0 ? (
                    <img src={court.images[0]} alt={court.name} className="h-44 w-full object-cover" />
                ) : (
                    <div className="h-44 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                        No photo
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{court.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 whitespace-nowrap">
                        {capitalize(court.sport)}
                    </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">{court.area}, {court.city}</p>
                <p className="text-sm font-medium">{RUPEE}{court.pricePerHour} / hour</p>

                {windows && windows.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {windows.map((w) => (
                            <span
                                key={w.startTime}
                                className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                            >
                                {formatTime(w.startTime)} - {formatTime(w.endTime)} ({RUPEE}{w.price})
                            </span>
                        ))}
                    </div>
                )}

                <Link
                    to={link}
                    className="mt-auto text-center bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 text-sm"
                >
                    View slots
                </Link>
            </div>
        </div>
    )
}

export default CourtCard