import { useEffect, useRef } from "react";
import { useProjectStore } from "@/store/projectStore/useProjectStore";

export const useProjectPolling = (intervalMs: number = 15000) => {
  const { fetchProject, project } = useProjectStore();

  // 1. Create a "Live Ref" to store the latest project data.
  // This allows the interval to read the current status WITHOUT restarting.
  const savedProject = useRef(project);

  // 2. Update the ref immediately whenever the project changes.
  useEffect(() => {
    savedProject.current = project;
  }, [project]);

  // 3. The Polling Effect (Stable)
  useEffect(() => {
    const tick = () => {
      const current = savedProject.current;

      // Stop polling if no project or already approved
      if (!current || current.status === "APPROVED") return;

      // Determine which token to use (Admin vs Public)
      // If we are the admin, we have 'adminToken'. If client, 'publicToken'.
      const token = current.adminToken || current.publicToken;

      if (token) {
        // Pass 'true' for silent mode (no loading spinners)
        fetchProject(token, true);
      }
    };

    // Start the timer ONLY ONCE
    const id = setInterval(tick, intervalMs);

    // Cleanup on unmount
    return () => clearInterval(id);

    // ⚠️ NOTICE: 'project' is NOT in this dependency array.
    // This ensures the timer never resets even if the project updates!
  }, [intervalMs, fetchProject]);
};
