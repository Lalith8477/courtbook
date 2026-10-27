import { createContext, useContext, useState } from "react"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const showToast = (message, type = "success") => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3500)
    }

    const colors = {
        success: "bg-emerald-600",
        error: "bg-red-600",
        info: "bg-blue-600"
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${colors[toast.type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg max-w-xs text-sm`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)