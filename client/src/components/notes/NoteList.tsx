import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { notes, API_URL } from "@/lib/api";
import type { Attachment } from "@/lib/api";
import type { Note, UploadJob } from "@/types/Note";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";
import NoteError from "./partials/NoteError";
import NoteDetailsSection from "./partials/NoteDetailsSection";
import SidebarTopBar from "./partials/SidebarTopBar";
import TopNavBar from "./partials/TopNavBar";

export function NoteList() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
            prev.map((job) => (job.id === jobId ? { ...job, progress } : job))
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
          job.id === jobId ? { ...job, progress: 100, status: "done" } : job
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
    console.info(
      "[upload] files selected",
      selectedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }))
    );
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


  const hasNotes = notesList && notesList.length > 0;

  return (
    <div className="relative h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
      <div className="relative z-10 flex h-full flex-col">
        <TopNavBar
          fetchNotes={fetchNotes}
          page={page}
          setIsCreating={setIsCreating}
          setSelectedNote={setSelectedNote}
          logout={logout}
        />

        {error && <NoteError error={error} fetchNotes={fetchNotes} page={page} />}

        <div className="grid h-[calc(100vh-72px)] min-h-0 grid-cols-[320px_1fr] gap-4 px-4 pb-4 pt-3">
          <SidebarTopBar
            notesList={notesList}
            totalAttachments={totalAttachments}
            isLoading={isLoading}
            isFetchingMore={isFetchingMore}
            page={page}
            totalPages={totalPages}
            hasNotes={hasNotes}
            selectedNote={selectedNote}
            fetchNotes={fetchNotes}
            selectNote={selectNote}
          />

          <NoteDetailsSection
            isCreating={isCreating}
            selectedNote={selectedNote}
            setIsCreating={setIsCreating}
            newNote={newNote}
            setNewNote={setNewNote}
            handleCreateNote={handleCreateNote}
            handleFileInput={handleFileInput}
            handleRemoveAttachment={handleRemoveAttachment}
            attachments={attachments}
            uploadJobs={uploadJobs}
            hasActiveUploads={hasActiveUploads}
            isSavingNote={isSavingNote}
            deleteNote={deleteNote}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}
