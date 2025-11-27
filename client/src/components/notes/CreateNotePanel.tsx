import type { JSX, ChangeEvent } from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Attachment } from "@/lib/api";
import type { UploadJob } from "@/types/Note";

type NewNoteState = { title: string; content: string };

interface CreateNotePanelProps {
  newNote: NewNoteState;
  attachments: Attachment[];
  uploadJobs: UploadJob[];
  isCreating: boolean;
  isSaving: boolean;
  hasActiveUploads: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (fileName: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  renderAttachmentPreview: (attachment: Attachment) => JSX.Element;
}

export function CreateNotePanel({
  newNote,
  attachments,
  uploadJobs,
  isCreating,
  isSaving,
  hasActiveUploads,
  onTitleChange,
  onContentChange,
  onFileInput,
  onRemoveAttachment,
  onCreate,
  onCancel,
  renderAttachmentPreview,
}: CreateNotePanelProps) {
  if (!isCreating) return null;

  return (
    <div className="h-full min-h-0 overflow-y-auto px-6 py-5 space-y-4">
      <input
        type="text"
        placeholder="Title"
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        value={newNote.title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <textarea
        placeholder="Write your note..."
        rows={6}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
        value={newNote.content}
        onChange={(e) => onContentChange(e.target.value)}
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
          onChange={onFileInput}
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
              {job.error && <p className="text-[11px] text-red-500">{job.error}</p>}
            </div>
          ))}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">Attached files</p>
          <div className="grid grid-cols-2 gap-3">
            {attachments.map((file) => (
              <div
                key={file.fileName}
                className="relative group overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                {renderAttachmentPreview(file)}
                <button
                  onClick={() => onRemoveAttachment(file.fileName)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 opacity-0 shadow-sm transition group-hover:opacity-100"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onCreate}
          className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
          disabled={hasActiveUploads || isSaving}
        >
          {hasActiveUploads ? "Uploading..." : isSaving ? "Saving..." : "Save note"}
        </Button>
        <Button
          variant="outline"
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
