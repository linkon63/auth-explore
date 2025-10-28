import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { notes } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching notes");
      const data = await notes.getAll();
      console.log("Fetched notes", data);
      setNotesList(data.notes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    console.log("Creating note", newNote);
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    console.log("Creating note", newNote);
    try {
      setIsCreating(true);
      await notes.create(newNote);
      setNewNote({ title: "", content: "" });
      await fetchNotes(); // Refresh the list
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <Button variant="destructive" className="mt-2 bg-red-500 hover:bg-red-600 border" onClick={() => logout()}>Logout</Button>
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
