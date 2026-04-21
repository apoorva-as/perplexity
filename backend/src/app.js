import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // allow localhost
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin);

    // allow vercel frontend
    const isVercel = origin.endsWith(".vercel.app");

    if (isLocal || isVercel) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;