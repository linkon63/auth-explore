import type { Note } from "@/types/Note";
import { AttachmentPreviewCard } from "./AttachmentPreviewCard";

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
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">Attachments</p>
                <span className="text-xs font-medium text-slate-500">
                  {selectedNote.file.length} file
                  {selectedNote.file.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="max-h-[32rem] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {selectedNote.file.map((file) => (
                    <AttachmentPreviewCard
                      key={file.fileName}
                      attachment={file}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
