import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Courts from "./pages/Courts"
import CourtDetails from "./pages/CourtDetails"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import MyBookings from "./pages/MyBookings"
import Notifications from "./pages/Notifications"
import OwnerDashboard from "./pages/OwnerDashboard"
import OwnerCourts from "./pages/OwnerCourts"
import CourtForm from "./pages/CourtForm"
import OwnerBookings from "./pages/OwnerBookings"
import NotFound from "./pages/NotFound"

const App = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                    <Route path="/" element={<Courts />} />
                    <Route path="/courts/:id" element={<CourtDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-bookings"
                        element={
                            <ProtectedRoute roles={["player"]}>
                                <MyBookings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute roles={["owner"]}>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/courts"
                        element={
                            <ProtectedRoute roles={["owner"]}>
                                <OwnerCourts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/courts/new"
                        element={
                            <ProtectedRoute roles={["owner"]}>
                                <CourtForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/courts/:id/edit"
                        element={
                            <ProtectedRoute roles={["owner"]}>
                                <CourtForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/owner/bookings"
                        element={
                            <ProtectedRoute roles={["owner"]}>
                                <OwnerBookings />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    )
}

export default App