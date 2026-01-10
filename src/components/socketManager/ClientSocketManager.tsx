import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getSocket } from "@/lib/socket/socket";
import { PROJECT_KEYS } from "@/hooks/useProject/project.keys";
import type { Project, ProjectStatus } from "@/types/project/project";

// Types matching your backend payloads
interface StatusPayload {
  status: ProjectStatus;
  latestComment?: string | null;
}

interface ExpirationPayload {
  expiresAt: string;
}

export const ClientSocketManager = () => {
  const { token } = useParams(); // Public token from URL
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = getSocket();

    // 1. Connection & Join Logic
    const handleJoin = () => {
      console.log(`🔌 Client Connected! Joining room: ${token}`);
      socket.emit("join-project", { token });
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleJoin();
    }

    // --- HANDLER 1: STATUS UPDATE ---
    const handleStatusUpdate = (payload: StatusPayload) => {
      console.log("Client Socket: Status Update", payload);

      queryClient.setQueryData(
        PROJECT_KEYS.public(token),
        (oldProject: Project | undefined) => {
          if (!oldProject) return undefined;
          return {
            ...oldProject,
            status: payload.status,
            clientFeedback: payload.latestComment ?? "",
          };
        }
      );
    };

    // --- HANDLER 2: EXPIRATION UPDATE ---
    const handleExpirationUpdate = (payload: ExpirationPayload) => {
      console.log("Client Socket: Expiration Update", payload);

      queryClient.setQueryData(
        PROJECT_KEYS.public(token),
        (oldProject: Project | undefined) => {
          if (!oldProject) return undefined;
          return { ...oldProject, expiresAt: payload.expiresAt };
        }
      );
    };

    // --- HANDLER 3: FILES (Upload & Delete) ---
    // Triggers whenever Admin uploads OR deletes a file
    const handleFileRefresh = () => {
      // Invalidate query to refetch the fresh list of files
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.public(token) });
    };

    // --- ATTACH LISTENERS ---
    socket.on("connect", handleJoin);
    socket.on("project-status-updated", handleStatusUpdate);
    socket.on("project-expiration-updated", handleExpirationUpdate);

    // Listen for both upload and delete events
    socket.on("file-uploaded", handleFileRefresh);
    socket.on("file-deleted", handleFileRefresh);

    // --- CLEANUP ---
    return () => {
      socket.emit("leave-project", { token });

      socket.off("connect", handleJoin);
      socket.off("project-status-updated", handleStatusUpdate);
      socket.off("project-expiration-updated", handleExpirationUpdate);
      socket.off("file-uploaded", handleFileRefresh);
      socket.off("file-deleted", handleFileRefresh);
    };
  }, [token, queryClient]);

  return null;
};
