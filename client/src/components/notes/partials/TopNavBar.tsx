import { Button } from "@/components/ui/button";
import { LogOut, MonitorSmartphone, Plus, Sparkles } from "lucide-react";
import type { Note } from "@/types/Note";

export default function TopNavBar({
  fetchNotes,
  page,
  setIsCreating,
  setSelectedNote,
  logout,
}: {
  fetchNotes: (page: number) => Promise<void>;
  page: number;
  setIsCreating: (value: boolean) => void;
  setSelectedNote: (note: Note | null) => void;
  logout: () => void;
}) {
  return (
    <div>
      {" "}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MonitorSmartphone className="h-4 w-4 text-amber-500" />
            <span>Notx Board</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-700 hover:bg-slate-100"
            onClick={() => fetchNotes(page)}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            onClick={() => {
              setIsCreating(true);
              setSelectedNote(null);
            }}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
    </div>
  );
}
