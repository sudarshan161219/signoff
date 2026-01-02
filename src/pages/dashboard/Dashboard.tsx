import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from "@/store/projectStore/useProjectStore";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { FileUploader } from "@/components/dashboard/FileUploader";

import {
  Copy,
  ExternalLink,
  Loader2,
  FileIcon,
  Clock,
  CalendarDays,
} from "lucide-react";
import { useProjectPolling } from "@/hooks/useProjectPolling";

export const Dashboard = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [copyText, setCopyText] = useState("Copy Link");
  const [selectedDuration, setSelectedDuration] = useState(() => {
    if (!token) return "30";
    return localStorage.getItem(`signoff_duration_${token}`) || "30";
  });

  const { project, isLoading, error, fetchProject, updateExpiration } =
    useProjectStore();

  useProjectPolling(15000);

  useEffect(() => {
    if (token) {
      fetchProject(token).catch(() => navigate("/"));
    }
  }, [token, fetchProject, navigate]);

  // --- REMOVED THE USEEFFECT THAT SYNCED FROM BACKEND ---
  // We now rely purely on the Admin's LocalStorage and manual changes.

  const handleCopyLink = () => {
    if (!project) return;
    const url = `${window.location.origin}/view/${project.publicToken}`;
    navigator.clipboard.writeText(url);
    setCopyText("Copied!");
    setTimeout(() => setCopyText("Copy Link"), 2000);
  };

  const handleDurationChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = e.target.value;
    const days = Number(val);

    // 2. UPDATE UI & LOCAL STORAGE IMMEDIATELY
    setSelectedDuration(val);
    if (token) {
      localStorage.setItem(`signoff_duration_${token}`, val);
    }

    // 3. Update Backend in Background
    if (updateExpiration) {
      await updateExpiration(days);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  if (error || !project)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error || "Project not found"}
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {project.name}
            </h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} />
              <span className="text-zinc-500 text-sm font-mono">
                ID: {project.id.slice(0, 8)}...
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                window.open(`/view/${project.publicToken}`, "_blank")
              }
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-300 flex items-center gap-2 transition-colors"
            >
              <ExternalLink size={16} /> Preview
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <Copy size={16} /> {copyText}
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: UPLOAD AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6">Deliverable</h2>
              {project.file ? (
                <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl group">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500 shrink-0">
                      <FileIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">
                        {project.file.fileName}
                      </p>
                      <p className="text-xs text-zinc-500">Secured on R2</p>
                    </div>
                  </div>
                </div>
              ) : (
                <FileUploader />
              )}
            </div>

            {project.status === "CHANGES_REQUESTED" && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-red-500 font-semibold mb-2">
                  Client Feedback
                </h3>
                <p className="text-red-200/80 italic">
                  "{project.latestComment}"
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: INFO SIDEBAR */}
          <div className="space-y-6">
            {/* LINK SETTINGS */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 text-zinc-200 flex items-center gap-2">
                <Clock size={16} className="text-zinc-500" /> Link Settings
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-semibold tracking-wider ml-1">
                    Expires In
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={selectedDuration}
                      onChange={handleDurationChange}
                      className="w-full bg-black border border-zinc-700 hover:border-zinc-600 rounded-xl p-3 text-sm text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
                    >
                      <option value="3">3 Days (Urgent)</option>
                      <option value="7">7 Days (1 Week)</option>
                      <option value="30">30 Days (Standard)</option>
                      <option value="90">90 Days (Long term)</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-zinc-500">
                      <CalendarDays size={14} />
                    </div>
                  </div>
                </div>

                {project.expiresAt && (
                  <p className="text-[10px] text-zinc-500 text-right px-1">
                    Valid until:{" "}
                    {new Date(project.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Next Steps Block */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 text-zinc-200">Next Steps</h3>
              <ol className="space-y-4">
                <li
                  className={`flex gap-3 ${
                    project.file
                      ? "text-zinc-500 line-through"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                    1
                  </span>
                  Upload your file
                </li>
                <li
                  className={`flex gap-3 ${
                    project.status !== "PENDING"
                      ? "text-zinc-500 line-through"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                    2
                  </span>
                  Send link to client
                </li>
                <li
                  className={`flex gap-3 ${
                    project.status === "APPROVED"
                      ? "text-green-500"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                    3
                  </span>
                  Get Approved
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
