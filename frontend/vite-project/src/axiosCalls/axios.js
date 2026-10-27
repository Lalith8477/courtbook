import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8084"

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

export const getError = (err) => {
    if (err.response && err.response.data && err.response.data.message) {
        return err.response.data.message
    }
    if (err.message === "Network Error") {
        return "Cannot reach the server. Please try again"
    }
    return "Something went wrong. Please try again"
}

export default axiosInstance