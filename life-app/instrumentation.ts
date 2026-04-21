// Patch Node.js 25+ localStorage global for SSR compatibility.
// Node.js 25 exposes a built-in localStorage global that may lack proper
// Storage methods (getItem, setItem, etc.) when --localstorage-file is not
// configured, causing "localStorage.getItem is not a function" errors in
// dependencies that access localStorage during server-side rendering.
//
// Instead of replacing the global (which can crash V8), we patch missing
// methods onto the existing object, or delete it so libraries gracefully
// fall back to their "no localStorage" code paths.

export async function register() {
  if (typeof window === 'undefined' && typeof globalThis.localStorage !== 'undefined') {
    // Node.js 25 provides a localStorage global but it may be broken.
    // Safest option: remove it entirely so libraries see it as unavailable
    // and use their server-safe fallbacks.
    try {
      delete (globalThis as any).localStorage;
    } catch {
      // If delete fails, assign undefined
      (globalThis as any).localStorage = undefined;
    }
  }
}
