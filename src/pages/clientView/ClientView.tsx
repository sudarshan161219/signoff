import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Send, Download } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TimeRemaining } from "@/components/timeRemaining/TimeRemaining";
import { usePublicProject, useClientDecision } from "@/hooks/useProject/export";
import { ClientSocketManager } from "@/components/socketManager/ClientSocketManager";
import { useDownloadFile } from "@/hooks/useProject/storage/useDownloadFile";

export const ClientView = () => {
  const { token } = useParams();
  const { data: project, isLoading, error } = usePublicProject(token);
  const { mutate, isPending } = useClientDecision(token);
  const { downloadFile, isDownloading } = useDownloadFile();

  // Interaction State
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleDecision = async (status: "APPROVED" | "CHANGES_REQUESTED") => {
    if (token) {
      mutate({
        decision: status,
        feedback: feedback,
      });
    }
  };

  const handleDownload = () => {
    downloadFile(project.file.fileId, project.file.filename, token, "download");
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  if (error || !project)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Project not found.
      </div>
    );
  if (!project)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Project not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      <ClientSocketManager projectId={project.id} />
      {/* Top Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg text-white">{project.name}</h1>

              <TimeRemaining expiresAt={project?.expiresAt} />
            </div>
            <p className="text-xs text-zinc-500">Review requested</p>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* FILE VIEWER */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl min-h-[50vh] flex items-center justify-center relative group">
          {project.file ? (
            project.file.mimeType.startsWith("image/") ? (
              <img
                src={project.file.url}
                alt="Deliverable"
                className="max-h-[80vh] w-auto object-contain"
              />
            ) : (
              <iframe
                src={project.file.url}
                className="w-full h-[80vh]"
                title="PDF Viewer"
              ></iframe>
            )
          ) : (
            <p className="text-zinc-500">No file uploaded yet.</p>
          )}

          {/* Hover Download Button */}
          {project.file && (
            <button
              className="absolute top-4 right-4 bg-black/80 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition hover:bg-black"
              onClick={() => handleDownload()}
              disabled={isDownloading}
            >
              <Download />
            </button>
          )}
        </div>

        {/* ACTION BAR (Only if Pending) */}
        {project.status === "PENDING" && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-zinc-900 border-t border-zinc-800 animate-in slide-in-from-bottom-4">
            <div className="max-w-xl mx-auto flex gap-4">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <XCircle size={20} /> Request Changes
                  </button>

                  <button
                    onClick={() => handleDecision("APPROVED")}
                    disabled={isPending}
                    className="flex-1 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                    Approve
                  </button>
                </>
              ) : (
                /* REJECT INPUT */
                <div className="w-full flex flex-col gap-4">
                  <textarea
                    autoFocus
                    placeholder="Describe the changes needed..."
                    className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-6 py-3 text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDecision("CHANGES_REQUESTED")}
                      disabled={isPending || !feedback.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      Send Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUCCESS MESSAGE (If Approved) */}
        {project.status === "APPROVED" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Project Approved
            </h2>
            <p className="text-zinc-400">The freelancer has been notified.</p>
          </div>
        )}
      </div>
    </div>
  );
};
