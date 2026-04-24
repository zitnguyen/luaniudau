import { io } from "socket.io-client";

let socketInstance = null;

const resolveSocketUrl = () => {
  const explicitUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitUrl) return explicitUrl;
  return "http://localhost:5000";
};

export const getRealtimeSocket = (token) => {
  if (!token) return null;
  if (socketInstance && socketInstance.connected) return socketInstance;
  if (socketInstance) {
    socketInstance.auth = { token };
    socketInstance.connect();
    return socketInstance;
  }
  socketInstance = io(resolveSocketUrl(), {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
    auth: { token },
  });
  return socketInstance;
};

export const disconnectRealtimeSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
};
