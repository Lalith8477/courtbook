import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { getError } from "../axiosCalls/axios"

const Login = () => {
    const { user, login } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)

    if (user) {
        return <Navigate to={user.role === "owner" ? "/owner" : "/"} replace />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim() || !password) {
            showToast("Please enter your email and password", "error")
            return
        }

        setSubmitting(true)
        try {
            const loggedIn = await login(email.trim(), password)
            showToast(`Welcome back, ${loggedIn.name}`, "success")
            navigate(loggedIn.role === "owner" ? "/owner" : "/")
        } catch (err) {
            showToast(getError(err), "error")
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"

    return (
        <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold mb-6">Login to CourtBook</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                >
                    {submitting ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-sm mt-4 text-gray-600 dark:text-gray-400">
                New here? <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-medium">Create an account</Link>
            </p>
        </div>
    )
}

export default Login