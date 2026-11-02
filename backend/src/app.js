import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

const allowedOrigins = [
"https://perplexity-eight-ivory.vercel.app",
"http://localhost:5173"
];

export const isAllowedOrigin = (origin) => {
if (!origin) return true;
return allowedOrigins.includes(origin);
};

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
origin: (origin, callback) => {
if (isAllowedOrigin(origin)) {
return callback(null, true);
}


    console.log("Blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
},
credentials: true,
methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"]


}));

app.get("/", (req, res) => {
res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;
