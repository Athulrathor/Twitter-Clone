import { io } from "../index.js";

export function initializeSocket() {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);

      console.log(`Joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });
}