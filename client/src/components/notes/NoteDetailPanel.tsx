import { Button } from "@/components/ui/button";
import type { Attachment } from "@/lib/api";
import { Edit, Trash2 } from "lucide-react";

interface NoteDetailPanelProps {
  title: string;
  content: string;
  updatedAt: string;
  attachments?: Attachment[];
  onEdit?: () => void;
  onDelete?: () => void;
  renderAttachmentPreview: (attachment: Attachment) => JSX.Element;
}

export function NoteDetailPanel({
  title,
  content,
  updatedAt,
  attachments = [],
  onEdit,
  onDelete,
  renderAttachmentPreview,
}: NoteDetailPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-6 py-4 text-sm text-slate-600">
        Last updated {new Date(updatedAt).toLocaleString()}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-700 hover:bg-slate-100"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-rose-500 hover:bg-slate-100"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap text-slate-700">{content}</p>

        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">Attachments</p>
            <div className="grid grid-cols-2 gap-3">
              {attachments.map((file) => (
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
  );
}
