import { useState, type ReactNode } from "react";
import type { Attachment } from "@/lib/api";
import { FileIcon, ImageIcon, PlayCircle } from "lucide-react";

type AttachmentPreviewCardProps = {
  attachment: Attachment;
};

export function AttachmentPreviewCard({ attachment }: AttachmentPreviewCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = attachment.mimeType?.startsWith("image");
  const isVideo = attachment.mimeType?.startsWith("video");
  const displayName = attachment.originalName || attachment.fileName;
  const extension = attachment.fileName.split(".").pop();
  const fileTag = isImage ? "Image" : isVideo ? "Video" : "File";
  const meta = [fileTag, extension?.toUpperCase() || attachment.mimeType]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm transition-shadow duration-200 hover:shadow-lg hover:shadow-slate-200/80">
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-slate-100/70 bg-white/70">
          {isImage && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="group/preview relative block w-full"
            >
              <figure className="relative aspect-video flex items-center justify-center bg-slate-50">
                <img
                  src={attachment.url}
                  alt={displayName}
                  className="max-h-full max-w-full object-contain"
                />
                <Badge icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
              </figure>
            </button>
          )}

          {isVideo && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="group/preview relative block w-full"
            >
              <figure className="relative aspect-video flex items-center justify-center bg-slate-50">
                <video
                  controls
                  className="max-h-full max-w-full object-contain"
                  src={attachment.url}
                />
                <Badge icon={<PlayCircle className="h-3.5 w-3.5" />} label="Video" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/80 p-3 text-slate-700 shadow-sm transition duration-300">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                </div>
              </figure>
            </button>
          )}

          {!isImage && !isVideo && (
            <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600">
              <FileIcon className="h-8 w-8" />
              <p className="mt-2 text-xs font-medium text-slate-700">{meta}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="text-xs text-slate-500">{meta}</p>
        </div>
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
        >
          View
        </a>
      </div>

      <PreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        label={displayName}
      >
        {isImage && (
          <img
            src={attachment.url}
            alt={displayName}
            className="max-h-[78vh] max-w-[80vw] rounded-xl object-contain shadow-lg"
          />
        )}
        {isVideo && (
          <video
            controls
            autoPlay
            className="max-h-[78vh] max-w-[80vw] rounded-xl object-contain shadow-lg"
            src={attachment.url}
          />
        )}
        {!isImage && !isVideo && (
          <div className="rounded-xl bg-white/90 p-6 text-slate-800 shadow-lg">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-slate-500 mt-1">{meta}</p>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
            >
              Open file
            </a>
          </div>
        )}
      </PreviewModal>
    </div>
  );
}

function Badge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur transition duration-300 group-hover:bg-white">
      {icon}
      {label}
    </span>
  );
}

function PreviewModal({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label={`${label} preview`}
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-slate-900/80 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white"
        >
          ✕
        </button>
        <div className="flex max-h-[80vh] min-w-[60vw] items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
