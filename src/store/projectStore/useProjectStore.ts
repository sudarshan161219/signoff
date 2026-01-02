import { create } from "zustand";
import api from "@/lib/api/api";
import axios from "axios";
import { type ProjectState, type ProjectStatus } from "@/types/project/project";

import { toast } from "sonner";

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isLoading: false,
  isSubmitting: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  fetchProject: async (token: string, silent = false) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }
    try {
      const storedToken = localStorage.getItem("signoff_admin_token");
      if (storedToken !== token) {
        throw new Error("Unauthorized: Token mismatch");
      }

      const { data } = await api.get(`/projects/admin/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ project: data.data });
    } catch (err: any) {
      console.error(err);
      if (!silent) {
        set({ error: "Failed to load", isLoading: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicProject: async (token: string, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });

    try {
      // Hit the PUBLIC view endpoint
      const { data } = await api.get(`/projects/view/${token}`);

      // Smart Update: Don't flicker if data is same
      const current = get().project;
      const next = data.data;

      if (
        current &&
        current.status === next.status &&
        current.expiresAt === next.expiresAt &&
        current.latestComment === next.latestComment
      ) {
        // No visual changes, skip update to prevent re-renders
        return;
      }

      set({ project: next, isLoading: false });
    } catch (error) {
      console.error("Client polling failed", error);
      // Don't set global error on silent poll (keeps UI clean)
      if (!silent) set({ error: "Failed to load project", isLoading: false });
    }
  },

  handleClientDecision: async (
    token: string,
    feedback: string,
    status: ProjectStatus
  ) => {
    // 1. Use the new specific loading state
    set({ isSubmitting: true, error: null });

    try {
      const { data } = await api.post(`/projects/${token}/status`, {
        status,
        comment: feedback,
      });

      set((state) => ({
        isSubmitting: false, // Turn off button spinner
        project: data.data || {
          ...state.project,
          status,
          clientFeedback: feedback,
        },
      }));

      toast.success(
        status === "APPROVED" ? "Project Approved! 🎉" : "Feedback sent"
      );
    } catch (error) {
      console.error(error);
      set({ isSubmitting: false });
      toast.error("Failed to send feedback. Please try again.");
    }
  },

  updateExpiration: async (days: number) => {
    const { project } = get();
    if (!project) return;

    // Optimistic UI update (optional, but feels faster)
    // set({ isLoading: true });

    try {
      // We use the admin token from the current project state
      // Note: ensure your backend route reads the token from Header or Body correctly
      await api.patch(
        `/projects/admin/expiration`,
        {
          days,
        },
        {
          headers: { Authorization: `Bearer ${project.adminToken}` },
        }
      );

      // Refresh data to get exact server time
      await get().fetchProject(project.adminToken);
      toast.success("Expiration updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update time");
    }
  },

  uploadDeliverable: async (file: File) => {
    const { project } = get();
    if (!project) return;

    set({ isUploading: true, uploadProgress: 0, error: null });

    try {
      // 1. Get Pre-signed URL
      const { data: signData } = await api.post("/storage/sign-url", {
        filename: file.name,
        mimetype: file.type,
        size: file.size,
      });

      const { uploadUrl, key } = signData;

      // 2. Upload to R2 (Directly)
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (ev) => {
          const percent = Math.round(
            (ev.loaded * 100) / (ev.total || file.size)
          );
          set({ uploadProgress: percent });
        },
      });

      // 3. Confirm to Backend
      const { data: confirmData } = await api.post("/storage/confirm", {
        key,
        filename: file.name,
        size: file.size,
        mimetype: file.type,
        // Using header-based auth, so we don't strictly need project ID in body if backend infers it
      });

      // 4. Update Local State immediately
      set((state) => ({
        project: state.project
          ? { ...state.project, file: confirmData.attachment }
          : null,
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Upload failed. Please try again." });
    } finally {
      set({ isUploading: false, uploadProgress: 0 });
    }
  },

  // --- DELETE PROJECT ACTION ---
  deleteProject: async () => {
    const { project } = get();

    // Safety check: can't delete if we don't have a project loaded
    if (!project || !project.adminToken) return;

    set({ isLoading: true });

    try {
      // Call the backend route: DELETE /api/projects/admin/me
      await api.delete("/projects/admin/me", {
        headers: {
          Authorization: `Bearer ${project.adminToken}`,
        },
      });

      // On success, wipe the store state
      set({ project: null, isLoading: false, error: null });

      toast.success("Project deleted permanently");
    } catch (error) {
      console.error("Delete failed:", error);
      set({ isLoading: false });
      toast.error("Failed to delete project. Please try again.");
      throw error; // Re-throw so the UI knows it failed (and keeps modal open)
    }
  },
}));
