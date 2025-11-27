import { FileIcon, Paperclip } from "lucide-react";
import type { NoteDraft, UploadJob } from "@/types/Note";
import type { Attachment } from "@/lib/api";
import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

export default function CreateNote({
  newNote,
  setNewNote,
  handleFileInput,
  handleRemoveAttachment,
  attachments,
  uploadJobs,
  hasActiveUploads,
  isSavingNote,
  handleCreateNote,
  setIsCreating,
}: {
  newNote: NoteDraft;
  setNewNote: Dispatch<SetStateAction<NoteDraft>>;
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAttachment: (fileName: string) => void;
  attachments: Attachment[];
  uploadJobs: UploadJob[];
  hasActiveUploads: boolean;
  isSavingNote: boolean;
  handleCreateNote: () => Promise<void>;
  setIsCreating: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <Button
          onClick={() => handleCreateNote()}
          className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
          disabled={hasActiveUploads || isSavingNote}
        >
          {hasActiveUploads
            ? "Uploading..."
            : isSavingNote
            ? "Saving..."
            : "Save note"}
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          onClick={() => setIsCreating(false)}
        >
          Cancel
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y px-6 py-5 space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
        />
        <textarea
          placeholder="Write your note..."
          rows={6}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <label className="block rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
            className="mt-2 w-full cursor-pointer text-xs text-slate-600 file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-slate-700 file:hover:bg-slate-100"
          />
        </label>

        {uploadJobs.length > 0 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {uploadJobs.map((job) => (
              <div key={job.id} className="space-y-1 rounded-md bg-white p-2">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate">{job.name}</span>
                  <span>
                    {job.status === "done"
                      ? "Done"
                      : job.status === "error"
                      ? "Error"
                      : `${job.progress || 0}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      job.status === "error" ? "bg-red-400" : "bg-amber-300"
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                {job.error && (
                  <p className="text-[11px] text-red-500">{job.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Attached files</p>
            <div className="max-h-[28rem] min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {attachments.map((file) => (
                  <div
                    key={file.fileName}
                    className="relative group overflow-hidden rounded-lg border border-slate-200 bg-white"
                  >
                    {renderAttachmentPreview(file)}
                    <button
                      onClick={() => handleRemoveAttachment(file.fileName)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
