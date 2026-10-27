import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Please login first" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select("-password")
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" })
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired session" })
    }
}

export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You are not allowed to do this" })
        }
        next()
    }
}