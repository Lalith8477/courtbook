import { io } from "socket.io-client"
import axiosInstance from "./axiosCalls/axios"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:8084"

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    auth: (cb) => {
        axiosInstance.get("/auth/socket-token")
            .then((res) => cb({ token: res.data.token }))
            .catch(() => cb({}))
    }
})

export default socket