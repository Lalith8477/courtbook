import { createContext, useContext, useEffect, useState } from "react"
import axiosInstance from "../axiosCalls/axios"
import socket from "../socket"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosInstance.get("/auth/me")
            .then((res) => setUser(res.data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (user) {
            socket.connect()
        } else {
            socket.disconnect()
        }
        return () => {
            socket.disconnect()
        }
    }, [user])

    const login = async (email, password) => {
        const res = await axiosInstance.post("/auth/login", { email, password })
        setUser(res.data.user)
        return res.data.user
    }

    const register = async (name, email, password, role) => {
        const res = await axiosInstance.post("/auth/register", { name, email, password, role })
        setUser(res.data.user)
        return res.data.user
    }

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout")
        } finally {
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)