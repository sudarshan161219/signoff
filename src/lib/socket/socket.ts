import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    socket = io(URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};
