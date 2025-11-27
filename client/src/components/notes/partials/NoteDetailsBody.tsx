import type { Attachment } from "@/lib/api";
import type { Note } from "@/types/Note";
import { FileIcon } from "lucide-react";

export default function NoteDetailsBody({
  selectedNote,
}: {
  selectedNote: Note | null;
}) {
  return (
    <div>
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-200 px-6 py-4 text-sm text-slate-600">
          Last updated {new Date(selectedNote?.updatedAt || "").toLocaleString()}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {selectedNote?.title}
          </h2>
          <p className="whitespace-pre-wrap text-slate-700">
            {selectedNote?.content}
          </p>

          {selectedNote?.file && selectedNote.file.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-800">Attachments</p>
              <div className="grid grid-cols-2 gap-3">
                {selectedNote.file.map((file) => (
                  <div
                    key={file.fileName}
                    className="rounded-lg border border-slate-200 bg-white p-2"
                  >
                    {renderAttachmentPreview(file)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
        className="w-full h-40 object-cover rounded-xl border border-slate-200 bg-slate-100"
        src={attachment.url}
      />
    );
  }

  if (isImage) {
    return (
      <img
        src={attachment.url}
        alt={attachment.fileName}
        className="w-full h-40 object-cover rounded-xl border border-slate-200 bg-slate-100"
      />
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">
      <FileIcon className="h-4 w-4 text-slate-500" />
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-2 text-amber-600 truncate"
      >
        {attachment.originalName || attachment.fileName}
      </a>
    </div>
  );
};
