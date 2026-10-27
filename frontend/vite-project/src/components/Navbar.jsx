import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"
import { useNotifications } from "../context/NotificationContext"

const Navbar = () => {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const { showToast } = useToast()
    const { unreadCount } = useNotifications()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        showToast("Logged out successfully", "success")
        navigate("/login")
    }

    const linkClass = ({ isActive }) =>
        isActive
            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
            : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <Link to="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    CourtBook
                </Link>

                <nav className="flex flex-wrap items-center gap-4 text-sm">
                    <NavLink to="/" end className={linkClass}>Courts</NavLink>

                    {user && user.role === "player" && (
                        <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
                    )}

                    {user && user.role === "owner" && (
                        <>
                            <NavLink to="/owner" end className={linkClass}>Dashboard</NavLink>
                            <NavLink to="/owner/courts" className={linkClass}>My Courts</NavLink>
                            <NavLink to="/owner/bookings" className={linkClass}>Bookings</NavLink>
                        </>
                    )}

                    {!user && (
                        <>
                            <NavLink to="/login" className={linkClass}>Login</NavLink>
                            <NavLink to="/signup" className={linkClass}>Sign up</NavLink>
                        </>
                    )}

                    {user && (
                        <Link
                            to="/notifications"
                            title="Notifications"
                            className="relative text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Toggle dark mode"
                    >
                        {theme === "dark" ? "Light" : "Dark"}
                    </button>

                    {user && (
                        <>
                            <span className="text-gray-500 dark:text-gray-400">{user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navbar