import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  File as FileIcon,
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
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    fetchNotes(1);
  }, []);

  const fetchNotes = async (curruntPage?: number) => {
    try {
      setIsLoading(true);
      const targetPage = curruntPage ?? 1;
      setPage(targetPage);
      console.info("[notes] fetching page", targetPage);
      const data = await notes.getAll(targetPage);
      console.info("[notes] fetch success", {
        count: data?.notes?.length,
        totalPages: data?.totalPages,
      });
      setNotesList(data.notes);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      console.error("[notes] fetch error", err);
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
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
      await notes.create({
        title: newNote.title,
        content: newNote.content,
        file: attachments,
      });
      setNewNote({ title: "", content: "" });
      setAttachments([]);
      setUploadJobs([]);
      console.info("[notes] create success");
      await fetchNotes();
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

  const renderAttachmentPreview = (attachment: Attachment) => {
    const isImage = attachment.mimeType?.startsWith("image");
    const isVideo = attachment.mimeType?.startsWith("video");

    if (isVideo) {
      return (
        <video
          controls
          className="w-full h-40 object-cover rounded border"
          src={attachment.url}
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="w-full h-40 object-cover rounded border"
        />
      );
    }

    return (
      <div className="flex items-center space-x-2 border rounded p-3 bg-gray-50">
        <FileIcon className="h-4 w-4 text-gray-600" />
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline text-blue-700 truncate"
        >
          {attachment.originalName || attachment.fileName}
        </a>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Error: {error}</p>
        <Button variant="outline" className="mt-2" onClick={fetchNotes}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Notes</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div>
        {/* user info */}
        <p>Logged in as: {user?.email}</p>
        <Button
          variant="destructive"
          className="mt-2 bg-red-500 hover:bg-red-600 border"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 border rounded"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                />
              </div>
              <div>
                <textarea
                  placeholder="Content"
                  rows={3}
                  className="w-full p-2 border rounded"
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="file"
                  placeholder="Input your files"
                  multiple
                  name="attachment"
                  onChange={handleFileInput}
                  accept="*/*"
                  className="w-full p-2 border rounded"
                />

                {uploadJobs.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border rounded p-2 bg-gray-50 space-y-1"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{job.name}</span>
                          <span>
                            {job.status === "done"
                              ? "Done"
                              : job.status === "error"
                                ? "Error"
                                : `${job.progress || 0}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                          <div
                            className={`h-2 ${
                              job.status === "error"
                                ? "bg-red-500"
                                : "bg-gray-800"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        {job.error && (
                          <p className="text-xs text-red-600">{job.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Attached files</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {attachments.map((file) => (
                        <div key={file.fileName} className="relative group">
                          {renderAttachmentPreview(file)}
                          <button
                            onClick={() => handleRemoveAttachment(file.fileName)}
                            className="absolute top-2 right-2 bg-white/80 border rounded-full w-7 h-7 flex items-center justify-center text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCreateNote()}
                  className="hover:shadow-lg transition-shadow hover:border"
                  disabled={hasActiveUploads || isSavingNote}
                >
                  {hasActiveUploads
                    ? "Uploading..."
                    : isSavingNote
                      ? "Saving..."
                      : "Create Note"}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => fetchNotes(page - 1)}
            >
              Previous
            </Button>

            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => fetchNotes(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
      {isLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <section className="">
            <Loader2 className="animate-spin" />
          </section>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notesList &&
            notesList.length > 0 &&
            notesList.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/notes/${note.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {note.content.length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
      {notesList.length === 0 && !isCreating && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No notes found. Create your first note!
          </p>
        </div>
      )}
    </div>
  );
}
