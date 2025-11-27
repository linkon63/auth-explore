import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  File as FileIcon,
  NotebookPen,
  LogOut,
  Paperclip,
  Sparkles,
  Search,
  MonitorSmartphone,
  MoreHorizontal,
} from "lucide-react";
import { notes, API_URL } from "@/lib/api";
import type { Attachment } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  file?: Attachment[];
}

type UploadJob = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

export function NoteList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const hasActiveUploads = uploadJobs.some((job) => job.status === "uploading");
  const totalAttachments = notesList.reduce(
    (count, n) => count + (n.file?.length || 0),
    0
  );

  useEffect(() => {
    fetchNotes(1);
  }, []);

  const fetchNotes = async (curruntPage?: number, append = false) => {
    try {
      if (append) {
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      const targetPage = curruntPage ?? 1;
      setPage(targetPage);
      console.info("[notes] fetching page", targetPage);
      const data = await notes.getAll(targetPage);
      console.info("[notes] fetch success", {
        count: data?.notes?.length,
        totalPages: data?.totalPages,
      });
      let combined: Note[] = [];
      setNotesList((prev) => {
        const next = append
          ? [
              ...prev,
              ...data.notes.filter(
                (incoming: Note) =>
                  !prev.some((existing) => existing.id === incoming.id)
              ),
            ]
          : data.notes;
        combined = next;
        return next;
      });
      setTotalPages(data.totalPages);
      if (combined && combined.length > 0) {
        setSelectedNote((current) => {
          if (!current) return combined[0];
          const stillExists = combined.find((n: Note) => n.id === current.id);
          return stillExists || combined[0];
        });
      } else {
        setSelectedNote(null);
      }
      setError(null);
    } catch (err) {
      console.error("[notes] fetch error", err);
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleCreateNote = async () => {
    console.info("[notes] create clicked", {
      title: newNote.title,
      contentLength: newNote.content.length,
      attachmentCount: attachments.length,
      hasActiveUploads,
    });
    if (!newNote.title.trim() || !newNote.content.trim()) {
      console.warn("[notes] missing title/content");
      setError("Title and content are required.");
      return;
    }
    if (uploadJobs.some((job) => job.status === "uploading")) {
      console.warn("[notes] blocked: uploads still running", uploadJobs);
      setError("Please wait for uploads to finish before saving.");
      return;
    }
    try {
      setIsSavingNote(true);
      setIsCreating(true);
      console.info("[notes] create payload", {
        title: newNote.title,
        contentLength: newNote.content.length,
        attachments,
      });
      const created = await notes.create({
        title: newNote.title,
        content: newNote.content,
        file: attachments,
      });
      const savedNote: Note = {
        id: created?.note?.id || created?.id,
        title: created?.note?.title || created?.title || newNote.title,
        content: created?.note?.content || created?.content || newNote.content,
        createdAt:
          created?.note?.createdAt ||
          created?.createdAt ||
          new Date().toISOString(),
        updatedAt:
          created?.note?.updatedAt ||
          created?.updatedAt ||
          new Date().toISOString(),
        file: created?.note?.file || created?.file || attachments,
      };
      setNotesList((prev) => [savedNote, ...prev]);
      setSelectedNote(savedNote);
      setNewNote({ title: "", content: "" });
      setAttachments([]);
      setUploadJobs([]);
      console.info("[notes] create success");
    } catch (err) {
      console.error("[notes] create error", err);
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setIsSavingNote(false);
      setIsCreating(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      console.log("Deleting note", id);
      await notes.delete(id);
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const uploadFile = async (file: File) => {
    const jobId = `${file.name}-${Date.now()}`;
    console.info("[upload] start", { jobId, name: file.name, size: file.size });
    setUploadJobs((prev) => [
      ...prev,
      { id: jobId, name: file.name, progress: 0, status: "uploading" },
    ]);

    const token = localStorage.getItem("token");
    if (!token) {
      setUploadJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "error", error: "No token found" }
            : job
        )
      );
      setError("No token found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadJobs((prev) =>
            prev.map((job) =>
              job.id === jobId ? { ...job, progress } : job
            )
          );
        },
      });

      const uploaded = res.data?.files?.[0];
      if (uploaded) {
        console.info("[upload] complete", uploaded);
        setAttachments((prev) => [...prev, uploaded]);
      }

      setUploadJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, progress: 100, status: "done" }
            : job
        )
      );
    } catch (uploadErr) {
      console.error("[upload] error", uploadErr);
      setUploadJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "error", error: "Upload failed" }
            : job
        )
      );
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    console.info("[upload] files selected", selectedFiles.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })));
    selectedFiles.forEach((file) => uploadFile(file));
    // allow re-selecting the same file name after upload
    e.target.value = "";
  };

  const handleRemoveAttachment = async (fileName: string) => {
    setAttachments((prev) => prev.filter((file) => file.fileName !== fileName));
    try {
      await notes.deleteFile(fileName);
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
  };

  const renderAttachmentPreview = (attachment: Attachment) => {
    const isImage = attachment.mimeType?.startsWith("image");
    const isVideo = attachment.mimeType?.startsWith("video");

    if (isVideo) {
      return (
        <video
          controls
          className="w-full h-40 object-cover rounded-xl border border-white/15 bg-white/10"
          src={attachment.url}
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="w-full h-40 object-cover rounded-xl border border-white/15 bg-white/10"
        />
      );
    }

    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-3 text-white">
        <FileIcon className="h-4 w-4 text-white/80" />
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-2 text-amber-100 truncate"
        >
          {attachment.originalName || attachment.fileName}
        </a>
      </div>
    );
  };

  const hasNotes = notesList && notesList.length > 0;

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <MonitorSmartphone className="h-4 w-4 text-amber-200" />
              <span>Notx Board</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => fetchNotes(page)}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              className="bg-white text-slate-950 shadow-sm hover:bg-slate-100"
              onClick={() => {
                setIsCreating(true);
                setSelectedNote(null);
              }}
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200/40 bg-red-100/10 text-red-50 hover:bg-red-100/20"
                onClick={() => fetchNotes(page)}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        <div className="grid h-[calc(100vh-72px)] min-h-0 grid-cols-[320px_1fr] gap-4 px-4 pb-4 pt-3">
          <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Notes</p>
                <p className="text-sm text-white">
                  {notesList.length} items - {totalAttachments} files
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  className="h-8 w-32 rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                  placeholder="Filter"
                  disabled
                />
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto min-h-0"
              onScroll={(e) => {
                const el = e.currentTarget;
                const nearBottom =
                  el.scrollHeight - el.scrollTop - el.clientHeight < 140;
                if (
                  nearBottom &&
                  !isFetchingMore &&
                  !isLoading &&
                  page < totalPages
                ) {
                  fetchNotes(page + 1, true);
                }
              }}
            >
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-200" />
                </div>
              ) : hasNotes ? (
                <ul className="divide-y divide-white/5">
                  {notesList.map((note) => {
                    const isActive = selectedNote?.id === note.id;
                    return (
                      <li key={note.id}>
                        <button
                          className={`w-full text-left px-4 py-3 transition ${
                            isActive
                              ? "bg-white/10 border-l-4 border-amber-300"
                              : "hover:bg-white/5"
                          }`}
                          onClick={() => selectNote(note)}
                        >
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              {note.file?.length ? (
                                <>
                                  <Paperclip className="h-3 w-3" />
                                  {note.file.length}
                                </>
                              ) : null}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-white truncate">
                            {note.title || "Untitled"}
                          </p>
                          <p className="text-sm text-white/60 line-clamp-2">
                            {note.content || "No content"}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {isFetchingMore && (
                <div className="flex items-center justify-center border-t border-white/5 bg-white/5 px-3 py-2 text-xs text-white/70">
                  Loading more...
                </div>
              )}
              {!isLoading && !hasNotes && (
                <div className="flex h-full items-center justify-center px-4 text-white/60">
                  No notes yet. Click New to start.
                </div>
              )}
            </div>
          </aside>

          <section className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200/20 text-amber-100">
                  <NotebookPen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                    {isCreating ? "New note" : "Preview"}
                  </p>
                  <p className="text-sm text-white/80">
                    {selectedNote ? selectedNote.title : "Select a note or create new"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isCreating && selectedNote && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/10"
                      onClick={() => navigate(`/notes/${selectedNote.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-rose-300 hover:bg-white/10"
                      onClick={() => deleteNote(selectedNote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setIsCreating(!isCreating)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {isCreating ? (
                <div className="h-full min-h-0 overflow-y-auto px-6 py-5 space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Write your note..."
                    rows={6}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                  <label className="block rounded-lg border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span>Attach files</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      name="attachment"
                      onChange={handleFileInput}
                      accept="*/*"
                      className="mt-2 w-full cursor-pointer text-xs text-white/60 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/20 file:px-3 file:py-2 file:text-white file:hover:bg-white/30"
                    />
                  </label>

                  {uploadJobs.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-white/15 bg-white/5 p-3">
                      {uploadJobs.map((job) => (
                        <div key={job.id} className="space-y-1 rounded-md bg-white/5 p-2">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span className="truncate">{job.name}</span>
                            <span>
                              {job.status === "done"
                                ? "Done"
                                : job.status === "error"
                                  ? "Error"
                                  : `${job.progress || 0}%`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${
                                job.status === "error" ? "bg-red-400" : "bg-amber-300"
                              }`}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          {job.error && <p className="text-[11px] text-red-200">{job.error}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white">Attached files</p>
                      <div className="grid grid-cols-2 gap-3">
                        {attachments.map((file) => (
                          <div key={file.fileName} className="relative group overflow-hidden rounded-lg border border-white/15 bg-white/5">
                            {renderAttachmentPreview(file)}
                            <button
                              onClick={() => handleRemoveAttachment(file.fileName)}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleCreateNote()}
                      className="bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                      disabled={hasActiveUploads || isSavingNote}
                    >
                      {hasActiveUploads ? "Uploading..." : isSavingNote ? "Saving..." : "Save note"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : selectedNote ? (
                <div className="flex h-full flex-col">
                  <div className="border-b border-white/10 px-6 py-4 text-sm text-white/60">
                    Last updated {new Date(selectedNote.updatedAt).toLocaleString()}
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
                    <h2 className="text-2xl font-semibold text-white">{selectedNote.title}</h2>
                    <p className="whitespace-pre-wrap text-white/80">{selectedNote.content}</p>

                    {selectedNote.file && selectedNote.file.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Attachments</p>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedNote.file.map((file) => (
                            <div key={file.fileName} className="rounded-lg border border-white/15 bg-white/5 p-2">
                              {renderAttachmentPreview(file)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  Select a note from the left to preview.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
