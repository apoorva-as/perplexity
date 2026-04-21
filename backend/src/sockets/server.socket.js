import { Server } from "socket.io";
import { isAllowedOrigin } from "../app.js";

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (isAllowedOrigin(origin)) {
                    return callback(null, true);
                }

                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true
        }
    });

    console.log("Socket.IO server initialized");

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
}

export function getIO() {
    if (!io) throw new Error("Socket not initialized");
    return io;
}
