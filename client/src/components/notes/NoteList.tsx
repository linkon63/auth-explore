import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { notes } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";
import { string } from "zod";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function NoteList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    file: [{ name: "", url: "" }],
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetchNotes(page);
    setIsLoading(false);
  }, []);

  const fetchNotes = async (curruntPage?: number) => {
    try {
      setIsLoading(true);
      setPage(curruntPage || 1);
      const data = await notes.getAll(curruntPage);
      setNotesList(data.notes);
      setTotalPages(data.totalPages);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const handleCreateNote = async () => {
    console.log("Creating note", newNote);
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    console.log("Creating note", newNote);
    try {
      setIsCreating(true);
      await notes.create({
        title: newNote.title,
        content: newNote.content,
        file: newNote.file,
      });
      setNewNote({ title: "", content: "", file: [{ name: "", url: "" }] });
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
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

  const fileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("file", e.target.files);
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create previews for all
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file); // 'files' should match the field name in multer
    });

    // upload logic
    console.log("before call apis", files);
    const req = await fetch("http://localhost:4000/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    console.log("after call apis", req);
    const data = await req.json();
    console.log("data", data);
    setNewNote({ ...newNote, file: data.files });
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
                  onChange={fileInput}
                  accept="image/*"
                  className="w-full p-2 border rounded"
                />

                <section>
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={src}
                            alt={`Preview ${idx}`}
                            className="w-40 h-40 object-cover rounded-md border"
                          />
                          <button
                            onClick={() => {
                              setPreviews(previews.filter((_, i) => i !== idx));
                              setFiles(files.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-14 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCreateNote()}
                  className="hover:shadow-lg transition-shadow hover:border"
                >
                  Create Note
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
