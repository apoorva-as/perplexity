import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const initializeSocketConnection = () => {

    const socket = io(API_BASE_URL, {
        withCredentials: true,
    })

    socket.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

}
