import type { UserPlan } from "@/config/plans";

export const DEVICE_ID_STORAGE_KEY = "diagnosehub-device-id";

export type DeviceAccountType = "private" | "workshop";

export type DeviceRegistration = {
  id: string;
  deviceId: string;
  deviceName: string;
  current: boolean;
  createdAt: string;
  lastSeenAt: string;
};

export type DeviceAccessResponse = {
  ok: boolean;
  code?: "DEVICE_LIMIT_REACHED";
  error?: string;
  plan: UserPlan | "free";
  accountType: DeviceAccountType;
  maxDevices: number;
  activeDeviceCount: number;
  currentDeviceId: string;
  devices: DeviceRegistration[];
};

function createFallbackDeviceId() {
  return `device-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getOrCreateDeviceId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existingDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const nextDeviceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : createFallbackDeviceId();

  localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);
  return nextDeviceId;
}

export function getDeviceName() {
  if (typeof window === "undefined") {
    return "Unbekanntes Gerät";
  }

  const userAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = userAgentData.userAgentData?.platform || navigator.platform || "";
  const touchHint = navigator.maxTouchPoints > 1 ? "Touch" : "Desktop";

  return [platform, touchHint].filter(Boolean).join(" · ") || "Dieses Gerät";
}

async function parseDeviceResponse(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as Partial<DeviceAccessResponse>;

  return {
    ...payload,
    ok: response.ok && payload.ok !== false,
  } as DeviceAccessResponse;
}

export async function registerCurrentDevice(accessToken: string) {
  const response = await fetch("/api/account/devices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: getOrCreateDeviceId(),
      deviceName: getDeviceName(),
    }),
  });

  return parseDeviceResponse(response);
}

export async function loadRegisteredDevices(accessToken: string) {
  const response = await fetch("/api/account/devices", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-diagnosehub-device-id": getOrCreateDeviceId(),
    },
  });

  return parseDeviceResponse(response);
}

export async function removeRegisteredDevice(
  accessToken: string,
  deviceId: string
) {
  const response = await fetch("/api/account/devices", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deviceId }),
  });

  return parseDeviceResponse(response);
}
