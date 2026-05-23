type CooldownMap = Record<string, number>;

function getCooldownMap(storageKey: string): CooldownMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CooldownMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function markCooldownSubmitted(storageKey: string, id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ ...getCooldownMap(storageKey), [id]: Date.now() })
  );
}

export function isCoolingDown(storageKey: string, id: string, cooldownMs: number): boolean {
  if (typeof window === "undefined") return false;
  const lastSubmittedAt = getCooldownMap(storageKey)[id];
  return Boolean(lastSubmittedAt && Date.now() - lastSubmittedAt < cooldownMs);
}

export function getCooldownSeconds(storageKey: string, id: string, cooldownMs: number): number {
  if (typeof window === "undefined") return 0;
  const lastSubmittedAt = getCooldownMap(storageKey)[id];
  if (!lastSubmittedAt) return 0;
  return Math.max(0, Math.ceil((cooldownMs - (Date.now() - lastSubmittedAt)) / 1000));
}
