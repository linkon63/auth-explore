import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  FileIcon,
  NotebookPen,
  Paperclip,
  Trash2,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Note, UploadJob } from "@/types/Note";
import type { Attachment } from "@/lib/api";
import NoteDetailsSectionTop from "./NoteDetailsSectionTop";
import NoteDetailsBody from "./NoteDetailsBody";
import CreateNote from "./CreateNote";

type NewNoteDraft = { title: string; content: string };

interface NoteDetailsSectionProps {
  isCreating: boolean;
  selectedNote: Note | null;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  newNote: NewNoteDraft;
  setNewNote: Dispatch<SetStateAction<NewNoteDraft>>;
  handleCreateNote: () => Promise<void>;
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (fileName: string) => void;
  attachments: Attachment[];
  uploadJobs: UploadJob[];
  hasActiveUploads: boolean;
  isSavingNote: boolean;
  deleteNote: (noteId: string) => void | Promise<void>;
  navigate: (to: string) => void;
}
export default function NoteDetailsSection({
  isCreating,
  selectedNote,
  setIsCreating,
  newNote,
  setNewNote,
  handleCreateNote,
  handleFileInput,
  handleRemoveAttachment,
  attachments,
  uploadJobs,
  hasActiveUploads,
  isSavingNote,
  deleteNote,
  navigate,
}: NoteDetailsSectionProps) {
  return (
    <div>
      <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-xl shadow-black/10">
        <NoteDetailsSectionTop
          isCreating={isCreating}
          selectedNote={selectedNote}
          setIsCreating={setIsCreating}
          deleteNote={deleteNote}
          navigate={navigate}
        />

        <div className="flex-1 overflow-hidden">
          {isCreating ? (
            <CreateNote
              newNote={newNote}
              setNewNote={setNewNote}
              handleFileInput={handleFileInput}
              handleRemoveAttachment={handleRemoveAttachment}
              attachments={attachments}
              uploadJobs={uploadJobs}
              hasActiveUploads={hasActiveUploads}
              isSavingNote={isSavingNote}
              handleCreateNote={handleCreateNote}
            />
          ) : selectedNote ? (
            <NoteDetailsBody selectedNote={selectedNote} />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Select a note from the left to preview.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
