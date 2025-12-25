import { io } from "socket.io-client";
import { BACKEND_URL } from "../../../admin/src/config";

export const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
});
