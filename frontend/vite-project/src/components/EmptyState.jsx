const EmptyState = ({ title, message, children }) => {
    return (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-xl border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {message && <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>}
            {children}
        </div>
    )
}

export default EmptyState