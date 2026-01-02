import { useEffect, useRef } from "react";
import { useProjectStore } from "@/store/projectStore/useProjectStore";

export const useClientPolling = (token: string, intervalMs: number = 15000) => {
  const { fetchPublicProject, project } = useProjectStore();

  // Ref pattern to prevent timer resets
  const savedStatus = useRef(project?.status);

  useEffect(() => {
    savedStatus.current = project?.status;
  }, [project?.status]);

  useEffect(() => {
    if (!token) return;

    const tick = () => {
      // Stop polling if we are already done
      if (savedStatus.current === "APPROVED") return;

      // Fetch silently (true)
      fetchPublicProject(token, true);
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [token, intervalMs, fetchPublicProject]);
};
