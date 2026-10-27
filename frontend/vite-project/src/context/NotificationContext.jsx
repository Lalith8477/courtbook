import { createContext, useContext, useEffect, useState } from "react"
import axiosInstance, { getError } from "../axiosCalls/axios"
import socket from "../socket"
import { useAuth } from "./AuthContext"
import { useToast } from "./ToastContext"

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const loadNotifications = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await axiosInstance.get("/notifications")
            setNotifications(res.data.notifications)
            setUnreadCount(res.data.unreadCount)
        } catch (err) {
            setError(getError(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            loadNotifications()
        } else {
            setNotifications([])
            setUnreadCount(0)
            setError("")
        }
    }, [user])

    useEffect(() => {
        if (!user) {
            return
        }
        const handleNew = (notification) => {
            setNotifications((prev) => [notification, ...prev])
            setUnreadCount((prev) => prev + 1)
            showToast(notification.message, "info")
        }
        socket.on("notification:new", handleNew)
        return () => {
            socket.off("notification:new", handleNew)
        }
    }, [user])

    const markAsRead = async (id) => {
        const target = notifications.find((n) => n._id === id)
        if (!target || target.isRead) {
            return
        }
        try {
            await axiosInstance.patch(`/notifications/${id}/read`)
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
            setUnreadCount((prev) => Math.max(prev - 1, 0))
        } catch (err) {
            showToast(getError(err), "error")
        }
    }

    const markAllAsRead = async () => {
        try {
            await axiosInstance.patch("/notifications/read-all")
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (err) {
            showToast(getError(err), "error")
        }
    }

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, loading, error, loadNotifications, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => useContext(NotificationContext)