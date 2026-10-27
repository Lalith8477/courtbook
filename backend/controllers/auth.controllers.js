import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import generateToken from "../utils/generateToken.js"
import cookieOptions from "../utils/cookieOptions.js"

const isProduction = process.env.NODE_ENV === "production"

const formatUser = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    }
}

export const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" })
        }

        const emailPattern = /^\S+@\S+\.\S+$/
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const safeRole = role === "owner" ? "owner" : "player"

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: safeRole
        })

        const token = generateToken(user._id)
        res.cookie("token", token, cookieOptions)
        res.status(201).json({ user: formatUser(user) })
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user._id)
        res.cookie("token", token, cookieOptions)
        res.status(200).json({ user: formatUser(user) })
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
            path: "/"
        })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (err) {
        next(err)
    }
}

export const getMe = async (req, res, next) => {
    try {
        res.status(200).json({ user: formatUser(req.user) })
    } catch (err) {
        next(err)
    }
}