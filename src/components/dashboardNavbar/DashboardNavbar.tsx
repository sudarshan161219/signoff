import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Plus,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore/useProjectStore";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { useClearStorage } from "@/hooks/clearStorage/useClearStorage";

export const DashboardNavbar = () => {
  // 1. Get deleteProject from store
  const { project, isLoading, deleteProject } = useProjectStore();
  const navigate = useNavigate();
  const { openModal, closeModal } = useModalStore();
  const { clearAppSession } = useClearStorage();

  // --- SCENARIO 1: DELETE PROJECT ---
  const handleDeleteClick = () => {
    openModal("WARNING", {
      title: "Delete Project?",
      description:
        "This will permanently delete the files, the link, and all data. This action cannot be undone.",
      confirmText: "Delete Everything",
      variant: "danger",
      onConfirm: async () => {
        if (deleteProject) await deleteProject();
        await deleteProject();
        clearAppSession(); // Wipe local
        closeModal(); // Close modal
        navigate("/"); // Redirect
      },
    });
  };

  // --- SCENARIO 2: LEAVE PAGE (New Project / Home) ---
  const handleLeaveClick = (e: React.MouseEvent) => {
    // Stop the <Link> from navigating immediately
    e.preventDefault();

    openModal("WARNING", {
      title: "Leave Page?",
      description:
        "Leaving this page will reset your current session data. Ensure you have the link saved if you want to return.",
      confirmText: "Leave & Reset",
      variant: "neutral",
      onConfirm: async () => {
        if (deleteProject) await deleteProject();
        clearAppSession();
        closeModal();
        navigate("/");
      },
    });
  };

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={handleLeaveClick} // <--- Intercept Navigation
            className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition"
          >
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <CheckCircle2 className="text-black" size={16} strokeWidth={3} />
            </div>
            <span className="hidden sm:inline">SignOff</span>
          </Link>

          {/* Divider */}
          <span className="text-zinc-700 h-4 border-r border-zinc-700 transform rotate-12"></span>

          {/* Dynamic Project Name */}
          <div className="text-sm font-medium text-zinc-200 truncate max-w-37.5 sm:max-w-75">
            {isLoading ? (
              <span className="flex items-center text-zinc-500 gap-2">
                <Loader2 size={12} className="animate-spin" /> Loading...
              </span>
            ) : (
              project?.name || (
                <span className="text-zinc-500">Select Project</span>
              )
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 1. PUBLIC LINK (Only if project exists) */}
          {project && (
            <a
              href={`/view/${project.publicToken}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              Public View <ExternalLink size={12} />
            </a>
          )}

          {/* 2. DELETE BUTTON (Danger Action) */}
          <button
            onClick={handleDeleteClick}
            title="Delete Project"
            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 size={18} />
          </button>

          {/* 3. NEW PROJECT BUTTON (Triggers Leave Warning) */}
          <Link
            to="/"
            onClick={handleLeaveClick} // <--- Intercept Navigation
            className="flex items-center gap-2 text-sm font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
