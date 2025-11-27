import { Loader2, Paperclip, Search } from "lucide-react";
import type { Note } from "@/types/Note";

interface SidebarTopBarProps {
  notesList: Note[];
  totalAttachments: number;
  isLoading: boolean;
  isFetchingMore: boolean;
  page: number;
  totalPages: number;
  hasNotes: boolean;
  selectedNote: Note | null;
  fetchNotes: (page: number) => Promise<void>;
  selectNote: (note: Note) => void;
}

export default function SidebarTopBar({
  notesList,
  totalAttachments,
  isLoading,
  isFetchingMore,
  page,
  totalPages,
  hasNotes,
  selectedNote,
  fetchNotes,
  selectNote,
}: SidebarTopBarProps) {
  return (
    <div>
      <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-lg shadow-black/10">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Notes
            </p>
            <p className="text-sm text-slate-700">
              {notesList.length} items - {totalAttachments} files
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-8 w-32 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              placeholder="Filter"
              disabled
            />
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto min-h-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            const nearBottom =
              el.scrollHeight - el.scrollTop - el.clientHeight < 140;
            if (
              nearBottom &&
              !isFetchingMore &&
              !isLoading &&
              page < totalPages
            ) {
              fetchNotes(page + 1);
            }
          }}
        >
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-200" />
            </div>
          ) : hasNotes ? (
            <ul className="divide-y divide-slate-100">
              {notesList.map((note) => {
                const isActive = selectedNote?.id === note.id;
                return (
                  <li key={note.id}>
                    <button
                      className={`w-full text-left px-4 py-3 border-l-2 transition-all duration-200 ${
                        isActive
                          ? "bg-amber-50 border-amber-300"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                      onClick={() => selectNote(note)}
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          {note.file?.length ? (
                            <>
                              <Paperclip className="h-3 w-3" />
                              {note.file.length}
                            </>
                          ) : null}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {note.title || "Untitled"}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {note.content || "No content"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {isFetchingMore && (
            <div className="flex items-center justify-center border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Loading more...
            </div>
          )}
          {!isLoading && !hasNotes && (
            <div className="flex h-full items-center justify-center px-4 text-slate-500">
              No notes yet. Click New to start.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
