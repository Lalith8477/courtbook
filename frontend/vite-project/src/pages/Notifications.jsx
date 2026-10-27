import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useNotifications } from "../context/NotificationContext"
import Spinner from "../components/Spinner"
import EmptyState from "../components/EmptyState"

const Notifications = () => {
    const { user } = useAuth()
    const { notifications, unreadCount, loading, error, loadNotifications, markAsRead, markAllAsRead } = useNotifications()
    const navigate = useNavigate()

    const handleOpen = async (notification) => {
        await markAsRead(notification._id)
        navigate(user.role === "owner" ? "/owner/bookings" : "/my-bookings")
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                        Mark all as read ({unreadCount})
                    </button>
                )}
            </div>

            {loading && <Spinner text="Loading notifications..." />}

            {!loading && error && (
                <EmptyState title="Could not load notifications" message={error}>
                    <button
                        onClick={loadNotifications}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700"
                    >
                        Try again
                    </button>
                </EmptyState>
            )}

            {!loading && !error && notifications.length === 0 && (
                <EmptyState title="No notifications yet" message="Booking updates will show up here." />
            )}

            {!loading && !error && notifications.length > 0 && (
                <div className="flex flex-col gap-2">
                    {notifications.map((n) => (
                        <button
                            key={n._id}
                            onClick={() => handleOpen(n)}
                            className={`text-left p-4 rounded-xl border flex items-start gap-3 ${
                                n.isRead
                                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                            }`}
                        >
                            {!n.isRead && <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0"></span>}
                            <div>
                                <p className="text-sm">{n.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(n.createdAt).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Notifications