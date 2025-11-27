import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { Note, NoteDraft, UploadJob } from "@/types/Note";
import type { Attachment } from "@/lib/api";
import NoteDetailsSectionTop from "./NoteDetailsSectionTop";
import NoteDetailsBody from "./NoteDetailsBody";
import CreateNote from "./CreateNote";

interface NoteDetailsSectionProps {
  isCreating: boolean;
  selectedNote: Note | null;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
  newNote: NoteDraft;
  setNewNote: Dispatch<SetStateAction<NoteDraft>>;
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
  newNote,
  attachments,
  uploadJobs,
  hasActiveUploads,
  isSavingNote,
  setIsCreating,
  setNewNote,
  handleCreateNote,
  handleFileInput,
  handleRemoveAttachment,
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
              setIsCreating={setIsCreating}
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
