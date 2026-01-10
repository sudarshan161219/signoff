import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/api";
import { toast } from "sonner";
import type { ApprovalDecisionType } from "@/types/project/project";
import { PROJECT_KEYS } from "./project.keys";

export const useClientDecision = (token?: string | null) => {
  const queryClient = useQueryClient();
  if (!token) throw new Error("No auth token available");
  return useMutation({
    mutationFn: async ({
      decision,
      feedback,
    }: {
      decision: ApprovalDecisionType;
      feedback: string;
    }) => {
      const { data } = await api.post(`/projects/${token}/status`, {
        decision,
        comment: feedback,
      });

      return data.data;
    },
    onSuccess: (updatedProject) => {
      toast.success("Feedback sent successfully");
      queryClient.setQueryData(PROJECT_KEYS.public(token), updatedProject);
    },
    onError: () => {
      toast.error("Failed to submit decision");
    },
  });
};
