const errorHandler = (err, req, res, next) => {
    console.log(err)
    let status = err.statusCode || 500
    let message = err.message || "Something went wrong on the server"

    if (err.name === "MulterError") {
        status = 400
        message = err.code === "LIMIT_FILE_SIZE" ? "Each image must be under 5MB" : err.message
    }

    if (err.name === "CastError") {
        status = 400
        message = "Invalid id"
    }

    if (err.name === "ValidationError") {
        status = 400
    }

    res.status(status).json({ message })
}

export default errorHandler