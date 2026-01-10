import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getSocket } from "@/lib/socket/socket";
import { PROJECT_KEYS } from "@/hooks/useProject/project.keys";

interface ExpirationPayload {
  expiresAt: string;
}

export const SocketManager = () => {
  const { token } = useParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      console.warn("⚠️ SocketManager mounted but NO TOKEN found in params.");
      return;
    }
    const socket = getSocket();

    // 1. Connection & Join Logic
    const handleJoin = () => {
      console.log(`🔌 Connected! Joining room: ${token}`);
      socket.emit("join-project", { token });
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleJoin();
    }

    // --- HANDLER 1: STATUS CHANGE ---
    const handleStatusUpdate = () => {
      const targetKey = PROJECT_KEYS.admin(token);
      console.log("Socket: Status Updated. Invalidating:", targetKey);
      queryClient.invalidateQueries({ queryKey: targetKey });
    };

    // --- HANDLER 2: EXPIRATION CHANGE ---
    const handleExpirationUpdate = (payload: ExpirationPayload) => {
      console.log("Socket: Expiration Update", payload);
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.admin(token) });
    };

    // --- HANDLER 3: FILES (Upload & Delete) ---
    // We can use a single function for both since the action is the same (refetch)
    const handleFileUpdate = () => {
      // 1. Invalidate Admin View (if it contains the file list)
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.admin(token) });

      // 2. (Optional) If you have a separate query specifically for files:
      // You would need the projectId here to invalidate ["project-files", projectId]
      // If you don't have projectId easily, invalidating the Admin Key above is usually enough.
    };

    // --- ATTACH LISTENERS ---
    socket.on("connect", handleJoin);
    socket.on("project-status-updated", handleStatusUpdate);
    socket.on("project-expiration-updated", handleExpirationUpdate);

    // Listen for both events created in StorageController
    socket.on("file-uploaded", handleFileUpdate);
    socket.on("file-deleted", handleFileUpdate);

    // --- CLEANUP ---
    return () => {
      socket.emit("leave-project", { token });

      socket.off("connect", handleJoin);
      socket.off("project-status-updated", handleStatusUpdate);
      socket.off("project-expiration-updated", handleExpirationUpdate);
      socket.off("file-uploaded", handleFileUpdate);
      socket.off("file-deleted", handleFileUpdate);
    };
  }, [token, queryClient]);

  return null;
};
