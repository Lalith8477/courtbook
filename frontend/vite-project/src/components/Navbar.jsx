import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useToast } from "../context/ToastContext"

const Navbar = () => {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const { showToast } = useToast()
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