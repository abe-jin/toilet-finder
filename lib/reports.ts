import { getCooldownSeconds, isCoolingDown, markCooldownSubmitted } from "@/lib/cooldown";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";
import type { ToiletReport, ToiletReportReason } from "@/lib/types";

const STORAGE_KEY = STORAGE_KEYS.reports;
const COOLDOWN_STORAGE_KEY = STORAGE_KEYS.reportCooldowns;
const COOLDOWN_MS = 30 * 60 * 1000;

export type ReportDraft = {
  toiletId: string;
  reason: ToiletReportReason;
  comment: string;
};

export type ReportStorageMode = "supabase" | "local";

export type CreateReportResult = {
  report: ToiletReport;
  storage: ReportStorageMode;
};

export function getLocalReports(toiletId?: string): ToiletReport[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ToiletReport[];
    const reports = Array.isArray(parsed) ? parsed : [];
    return toiletId ? reports.filter((report) => report.toiletId === toiletId) : reports;
  } catch {
    return [];
  }
}

export function createLocalReport(draft: ReportDraft): ToiletReport {
  const report: ToiletReport = {
    ...draft,
    comment: draft.comment.trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const reports = getLocalReports();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([report, ...reports]));
  markCooldownSubmitted(COOLDOWN_STORAGE_KEY, draft.toiletId);
  window.dispatchEvent(new Event("toilet-reports-updated"));
  return report;
}

export async function createReport(draft: ReportDraft): Promise<CreateReportResult> {
  if (isReportCoolingDown(draft.toiletId)) {
    throw new Error("cooldown");
  }

  if (!isSupabaseEnabled() || !supabase) {
    return {
      report: createLocalReport(draft),
      storage: "local"
    };
  }

  const report: ToiletReport = {
    ...draft,
    comment: draft.comment.trim(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const { data, error } = await supabase.from("reports").insert(reportToSupabaseInsert(report)).select("*").single();
  if (error) throw error;

  markCooldownSubmitted(COOLDOWN_STORAGE_KEY, draft.toiletId);
  window.dispatchEvent(new Event("toilet-reports-updated"));
  return {
    report: data ? supabaseRowToReport(data) : report,
    storage: "supabase"
  };
}

export function isReportCoolingDown(toiletId: string): boolean {
  return isCoolingDown(COOLDOWN_STORAGE_KEY, toiletId, COOLDOWN_MS);
}

export function getReportCooldownSeconds(toiletId: string): number {
  return getCooldownSeconds(COOLDOWN_STORAGE_KEY, toiletId, COOLDOWN_MS);
}

function reportToSupabaseInsert(report: ToiletReport) {
  return {
    id: report.id,
    toilet_id: report.toiletId,
    reason: report.reason,
    comment: report.comment || null,
    created_at: report.createdAt
  };
}

function supabaseRowToReport(row: {
  id: string;
  toilet_id: string;
  reason: ToiletReportReason;
  comment: string | null;
  created_at: string;
}): ToiletReport {
  return {
    id: row.id,
    toiletId: row.toilet_id,
    reason: row.reason,
    comment: row.comment ?? "",
    createdAt: row.created_at
  };
}
