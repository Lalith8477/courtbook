import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Courts from "./pages/Courts"
import CourtDetails from "./pages/CourtDetails"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

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
                </Routes>
            </main>
        </div>
    )
}

export default App