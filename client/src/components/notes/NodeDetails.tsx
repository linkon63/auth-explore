import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import { notes } from "@/lib/api";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NodeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const fetchNote = async () => {
    if (!id) return;

    try {
      const data = await notes.getOne(id);
      console.log("data", data);
      setNote(data.note);
      setFormData({
        title: data.note.title,
        content: data.note.content,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.title.trim() || !formData.content.trim()) return;

    try {
      setLoading(true);
      await notes.update(id, formData);
      await fetchNote();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !note) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => navigate("/notes")}
        >
          Back to Notes
        </Button>
      </div>
    );
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Note" : note.title}
        </h1>
        {!isEditing && (
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button variant="ghost" onClick={() => navigate("/notes")}>
              Back to Notes
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              disabled={loading}
              required
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  title: note.title,
                  content: note.content,
                });
              }}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="prose max-w-none">
          <div className="whitespace-pre-line bg-white p-6 rounded-lg border">
            {note.content}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
