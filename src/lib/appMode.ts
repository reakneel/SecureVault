export type AppMode = 'auto' | 'desktop' | 'cloud';

export function isDesktopRuntime(): boolean {
  // Tauri injects a global symbol into the window when running in desktop
  return typeof window !== 'undefined' && typeof (window as any).__TAURI_IPC__ === 'function';
}

export function getAppMode(): 'desktop' | 'cloud' {
  const configured = (((import.meta as any).env?.VITE_APP_MODE) as AppMode | undefined) || 'auto';
  if (configured === 'desktop') return 'desktop';
  if (configured === 'cloud') return 'cloud';
  return isDesktopRuntime() ? 'desktop' : 'cloud';
}

export const APP_MODE = getAppMode();

