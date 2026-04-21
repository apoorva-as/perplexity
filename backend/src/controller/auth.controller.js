import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

function getCookieOptions(req) {
    const origin = req.get("origin") || "";
    const isCrossSite = /^https:\/\/.+\.vercel\.app$/.test(origin);

    return {
        httpOnly: true,
        sameSite: isCrossSite ? "none" : "lax",
        secure: isCrossSite,
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
}

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, password }
 */
export async function register(req, res) {

    const { username, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        username
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this username already exists",
            success: false,
            err: "User already exists"
        })
    }

    const user = await userModel.create({ username, password })

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token, getCookieOptions(req))

    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username
        }
    });



}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { username, password }
 */
export async function login(req, res) {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username })

    if (!user) {
        return res.status(400).json({
            message: "Invalid username or password",
            success: false,
            err: "User not found"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid username or password",
            success: false,
            err: "Incorrect password"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token, getCookieOptions(req))

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username
        }
    })

}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}
