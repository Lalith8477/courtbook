import multer from "multer"

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        return cb(null, true)
    }
    const error = new Error("Only image files are allowed")
    error.statusCode = 400
    cb(error)
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
})

export default upload