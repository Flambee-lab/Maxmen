export const CONTENT_LIBRARY_UPDATED_EVENT = "maxmem-content-library-updated";

export function dispatchContentLibraryUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONTENT_LIBRARY_UPDATED_EVENT));
}
