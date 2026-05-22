"use client";

import { Button } from "@/components/ui/Button";
import {
  geocodeLocation,
  getLocationSearchHistory,
  saveLocationSearchHistory,
  type GeocodingResult
} from "@/lib/geocoding";
import { Clock3, Loader2, Search } from "lucide-react";
import { useState } from "react";

type LocationSearchProps = {
  onResolved: (result: GeocodingResult, query: string) => Promise<void> | void;
  compact?: boolean;
};

export function LocationSearch({ onResolved, compact = false }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>(() => getLocationSearchHistory());
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (nextQuery = query) => {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) return;

    try {
      setSearching(true);
      setMessage(null);
      const result = await geocodeLocation(trimmedQuery);
      if (!result) {
        setMessage("場所が見つかりませんでした");
        return;
      }
      saveLocationSearchHistory(trimmedQuery);
      setHistory(getLocationSearchHistory());
      setQuery(trimmedQuery);
      await onResolved(result, trimmedQuery);
    } catch {
      setMessage("検索に失敗しました。時間をおいて再度お試しください");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={compact ? "rounded-[24px] bg-white/92 p-2 shadow-soft backdrop-blur" : "rounded-[28px] bg-slate-50 p-3 ring-1 ring-slate-200/70"}>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[20px] bg-white px-3 ring-1 ring-slate-200">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="駅名・地名で探す"
            className="h-12 min-w-0 flex-1 bg-transparent text-base font-bold text-ink outline-none placeholder:text-slate-400"
          />
        </div>
        <Button type="submit" className="h-12 rounded-[20px] px-4" disabled={searching || !query.trim()}>
          {searching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          検索
        </Button>
      </form>

      {message ? <p className="mt-2 px-1 text-xs font-bold text-rose-600">{message}</p> : null}

      {history.length > 0 ? (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {history.map((item) => (
            <button
              key={item}
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200 active:scale-[0.98]"
              onClick={() => {
                setQuery(item);
                void submit(item);
              }}
            >
              <Clock3 size={12} />
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
