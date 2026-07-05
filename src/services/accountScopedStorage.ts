const GUEST_SCOPE = "guest";

export function getAccountScopedStorageKey(baseKey: string, userId?: string | null) {
  const scope = userId?.trim() || GUEST_SCOPE;

  return `${baseKey}:${scope}`;
}

export function readAccountScopedLocalStorage(
  baseKey: string,
  userId?: string | null
) {
  if (typeof window === "undefined") {
    return null;
  }

  const scopedValue = localStorage.getItem(
    getAccountScopedStorageKey(baseKey, userId)
  );

  if (scopedValue !== null || userId) {
    return scopedValue;
  }

  return localStorage.getItem(baseKey);
}

export function writeAccountScopedLocalStorage(
  baseKey: string,
  value: string,
  userId?: string | null
) {
  localStorage.setItem(getAccountScopedStorageKey(baseKey, userId), value);
}

export function removeAccountScopedLocalStorage(
  baseKey: string,
  userId?: string | null
) {
  localStorage.removeItem(getAccountScopedStorageKey(baseKey, userId));
}
