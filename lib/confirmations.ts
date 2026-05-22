import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  ConfirmationStatus,
  ToiletConfirmation,
  ToiletConfirmationSummary
} from "@/lib/types";

const STORAGE_KEY = "toilet-finder-confirmations-v1";
const COOLDOWN_STORAGE_KEY = "toilet-finder-confirmation-cooldowns-v1";
const COOLDOWN_MS = 10 * 60 * 1000;

export type ConfirmationStorageMode = "supabase" | "local";

export type CreateConfirmationResult = {
  confirmation: ToiletConfirmation;
  storage: ConfirmationStorageMode;
};

export type ConfirmationDraft = {
  toiletId: string;
  status: ConfirmationStatus;
};

type CooldownMap = Record<string, number>;

export function isSupabaseEnabled() {
  return isSupabaseConfigured && Boolean(supabase);
}

export function getLocalConfirmations(toiletId?: string): ToiletConfirmation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ToiletConfirmation[];
    const confirmations = Array.isArray(parsed) ? parsed : [];
    return toiletId ? confirmations.filter((item) => item.toiletId === toiletId) : confirmations;
  } catch {
    return [];
  }
}

export async function getConfirmations(toiletId: string): Promise<ToiletConfirmation[]> {
  if (!isSupabaseEnabled() || !supabase) {
    return getLocalConfirmations(toiletId);
  }

  const { data, error } = await supabase
    .from("confirmations")
    .select("*")
    .eq("toilet_id", toiletId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(supabaseRowToConfirmation);
}

export function createLocalConfirmation(draft: ConfirmationDraft): ToiletConfirmation {
  const confirmation: ToiletConfirmation = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const confirmations = getLocalConfirmations();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([confirmation, ...confirmations]));
  markConfirmationSubmitted(draft.toiletId);
  window.dispatchEvent(new Event("toilet-confirmations-updated"));
  return confirmation;
}

export async function createConfirmation(draft: ConfirmationDraft): Promise<CreateConfirmationResult> {
  if (isConfirmationCoolingDown(draft.toiletId)) {
    throw new Error("cooldown");
  }

  if (!isSupabaseEnabled() || !supabase) {
    return {
      confirmation: createLocalConfirmation(draft),
      storage: "local"
    };
  }

  const confirmation: ToiletConfirmation = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("confirmations")
    .insert(confirmationToSupabaseInsert(confirmation))
    .select("*")
    .single();

  if (error) throw error;

  markConfirmationSubmitted(draft.toiletId);
  window.dispatchEvent(new Event("toilet-confirmations-updated"));
  return {
    confirmation: data ? supabaseRowToConfirmation(data) : confirmation,
    storage: "supabase"
  };
}

export function summarizeConfirmations(confirmations: ToiletConfirmation[]): ToiletConfirmationSummary {
  const availableCount = confirmations.filter((item) => item.status === "available").length;
  const unavailableCount = confirmations.filter((item) => item.status === "unavailable").length;
  const lastConfirmedAt = confirmations
    .map((item) => item.createdAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    availableCount,
    unavailableCount,
    lastConfirmedAt,
    hasUnavailableReport: unavailableCount > 0
  };
}

export function formatLastConfirmed(isoDate?: string) {
  if (!isoDate) return "最終確認：まだありません";

  const date = new Date(isoDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - startOfDate) / 86_400_000);

  if (diffDays === 0) return "最終確認：今日";
  if (diffDays === 1) return "最終確認：昨日";
  if (diffDays < 7) return `最終確認：${diffDays}日前`;
  return `最終確認：${date.getMonth() + 1}/${date.getDate()}`;
}

export function isConfirmationCoolingDown(toiletId: string) {
  if (typeof window === "undefined") return false;
  const cooldowns = getCooldowns();
  const lastSubmittedAt = cooldowns[toiletId];
  return Boolean(lastSubmittedAt && Date.now() - lastSubmittedAt < COOLDOWN_MS);
}

export function getConfirmationCooldownSeconds(toiletId: string) {
  if (typeof window === "undefined") return 0;
  const lastSubmittedAt = getCooldowns()[toiletId];
  if (!lastSubmittedAt) return 0;
  return Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - lastSubmittedAt)) / 1000));
}

function markConfirmationSubmitted(toiletId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    COOLDOWN_STORAGE_KEY,
    JSON.stringify({
      ...getCooldowns(),
      [toiletId]: Date.now()
    })
  );
}

function getCooldowns(): CooldownMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CooldownMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function confirmationToSupabaseInsert(confirmation: ToiletConfirmation) {
  return {
    id: confirmation.id,
    toilet_id: confirmation.toiletId,
    status: confirmation.status,
    created_at: confirmation.createdAt
  };
}

function supabaseRowToConfirmation(row: {
  id: string;
  toilet_id: string;
  status: ConfirmationStatus;
  created_at: string;
}): ToiletConfirmation {
  return {
    id: row.id,
    toiletId: row.toilet_id,
    status: row.status,
    createdAt: row.created_at
  };
}
