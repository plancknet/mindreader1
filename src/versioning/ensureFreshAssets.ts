const VERSION_STORAGE_KEY = "app_version";

const clearRegistrations = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => undefined)));
  }
};

const purgeCaches = async () => {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)));
};

export const ensureFreshAssets = async (): Promise<boolean> => {
  const currentVersion = import.meta.env.VITE_APP_VERSION ?? "dev";
  try {
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    if (!storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
      return true;
    }

    if (storedVersion === currentVersion) {
      return true;
    }

    await Promise.all([clearRegistrations(), purgeCaches()]);
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    window.location.reload();
    return false;
  } catch (error) {
    console.warn("[versioning] Failed to verify cache version", error);
    localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    return true;
  }
};
