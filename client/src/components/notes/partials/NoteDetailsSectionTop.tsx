import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, NotebookPen, Trash2 } from "lucide-react";
import type { Note } from "@/types/Note";
import type { Dispatch, SetStateAction } from "react";
export default function NoteDetailsSectionTop({
  isCreating,
  selectedNote,
  setIsCreating,
  deleteNote,
  navigate,
}: {
  isCreating: boolean;
  selectedNote: Note | null;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  deleteNote: (noteId: string) => void | Promise<void>;
  navigate: (to: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {isCreating ? "New note" : "Preview"}
            </p>
            <p className="text-sm text-slate-700">
              {selectedNote
                ? selectedNote.title
                : "Select a note or create new"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isCreating && selectedNote && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-700 hover:bg-slate-100 "
                onClick={() => navigate(`/notes/${selectedNote.id}`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-rose-500 hover:bg-slate-100"
                onClick={() => deleteNote(selectedNote.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => setIsCreating(!isCreating)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
