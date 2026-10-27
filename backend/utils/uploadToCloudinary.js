import cloudinary from "../config/cloudinary.js"

const uploadBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "courtbook/courts", resource_type: "image" },
            (error, result) => {
                if (error) {
                    return reject(error)
                }
                resolve(result.secure_url)
            }
        )
        stream.end(buffer)
    })
}

export const uploadImages = async (files = []) => {
    return Promise.all(files.map((file) => uploadBuffer(file.buffer)))
}