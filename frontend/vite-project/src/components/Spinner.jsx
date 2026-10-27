const Spinner = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>
        </div>
    )
}

export default Spinner