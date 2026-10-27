import { Link } from "react-router-dom"
import EmptyState from "../components/EmptyState"

const NotFound = () => {
    return (
        <EmptyState title="Page not found" message="The page you are looking for does not exist.">
            <Link to="/" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700">
                Go to courts
            </Link>
        </EmptyState>
    )
}

export default NotFound