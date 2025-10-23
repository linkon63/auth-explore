import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { NoteForm } from './NoteForm';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
  };

  const handleFormSubmit = () => {
    setEditingNote(null);
    fetchNotes();
  };

  if (isLoading) return <div>Loading notes...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Notes</h2>
        <Button onClick={() => setEditingNote({} as Note)}>
          Add Note
        </Button>
      </div>

      {editingNote && (
        <Card>
          <CardHeader>
            <CardTitle>{editingNote.id ? 'Edit Note' : 'New Note'}</CardTitle>
          </CardHeader>
          <CardContent>
            <NoteForm 
              note={editingNote} 
              onSuccess={handleFormSubmit}
              onCancel={() => setEditingNote(null)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {note.content.length > 150 
                  ? `${note.content.substring(0, 150)}...` 
                  : note.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}