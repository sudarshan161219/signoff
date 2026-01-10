import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Plus,
  ExternalLink,
  Loader2,
  Trash2,
  Twitter,
  Coffee,
} from "lucide-react";
import { useModalStore } from "@/store/modalStore/useModalStore";
import { useClearStorage } from "@/hooks/clearStorage/useClearStorage";
import { useDeleteProject } from "@/hooks/useProject/useDeleteProject";
import { useAdminProject } from "@/hooks/useProject/useAdminProject";

export const DashboardNavbar = () => {
  const { token } = useParams();

  const { data: project } = useAdminProject(token);
  const { mutate: deleteProject, isPending: isLoading } =
    useDeleteProject(token);

  const navigate = useNavigate();
  const { openModal, closeModal } = useModalStore();
  const { clearAppSession } = useClearStorage();

  const handleDeleteClick = () => {
    openModal("WARNING", {
      title: "Delete Project?",
      description:
        "This will permanently delete the files, the link, and all data. This action cannot be undone.",
      confirmText: "Delete Everything",
      variant: "danger",
      onConfirm: async () => {
        deleteProject();
        clearAppSession();
        navigate("/");
      },
    });
  };

  const handleLeaveClick = (e: React.MouseEvent) => {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* LEFT: Logo & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            to="/"
            onClick={handleLeaveClick}
            className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition"
          >
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <CheckCircle2 className="text-black" size={16} strokeWidth={3} />
            </div>
            <span className="hidden sm:inline">SignOff</span>
          </Link>

          {/* Divider - Hide on very small screens to save space */}
          <span className="hidden xs:block text-zinc-700 h-4 border-r border-zinc-700 transform rotate-12"></span>

          {/* Project Name */}
          <div className="text-sm font-medium text-zinc-200 truncate max-w-25 sm:max-w-xs">
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              project?.name || <span className="text-zinc-500">Project</span>
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* 1. FOLLOW ON X */}
          <a
            href="https://x.com/buildwithSud"
            target="_blank"
            rel="noreferrer"
            title="Follow on X"
            // Changed 'hidden sm:flex' to 'flex'
            // Added 'px-2' for mobile, 'sm:px-3' for desktop
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition px-2 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-800"
          >
            <Twitter size={14} />
            {/* Text hidden on mobile, visible on small screens+ */}
            <span className="hidden sm:inline">Follow</span>
          </a>

          {/* 2. BUY ME A COFFEE */}
          <a
            href="https://buymeacoffee.com/sudarshanhosalli"
            target="_blank"
            rel="noreferrer"
            title="Support"
            className="flex items-center gap-2 text-xs font-medium text-amber-300 hover:text-amber-200 transition px-2 sm:px-3 py-1.5 rounded-lg hover:bg-amber-500/10 border border-amber-500/20"
          >
            <Coffee size={14} />
            <span className="hidden sm:inline">Support</span>
          </a>

          {/* 3. PUBLIC LINK */}
          {project && (
            <a
              href={`/view/${project.publicToken}`}
              target="_blank"
              rel="noreferrer"
              title="Public View"
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition px-2 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Public View</span>
            </a>
          )}

          {/* Divider for actions */}
          <div className="w-px h-4 bg-zinc-800 mx-1"></div>

          {/* 4. DELETE BUTTON */}
          <button
            onClick={handleDeleteClick}
            title="Delete Project"
            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
          >
            <Trash2 size={18} />
          </button>

          {/* 5. NEW PROJECT BUTTON */}
          <Link
            to="/"
            onClick={handleLeaveClick}
            className="flex items-center gap-2 text-sm font-bold bg-white text-black px-2 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
