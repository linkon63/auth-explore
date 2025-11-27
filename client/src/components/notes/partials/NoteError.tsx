import { Button } from "@/components/ui/button";

export default function NoteError({
  error,
  fetchNotes,
  page,
}: {
  error: string;
  fetchNotes: (page: number) => void;
  page: number;
}) {
  return (
    <div>
      <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 bg-white text-red-700 hover:bg-red-50"
            onClick={() => fetchNotes(page)}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
