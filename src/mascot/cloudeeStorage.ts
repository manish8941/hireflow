import { useState, useEffect, useCallback } from 'react';

const MASCOT_ENABLED_KEY = 'hireflow_mascot_enabled';
const LEGACY_CLOUDEE_ENABLED_KEY = 'hireflow_cloudee_enabled';
const CLOUDEE_STORAGE_EVENT = 'hireflow_cloudee_toggle';

export const isCloudeeEnabled = (): boolean => {
  try {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(MASCOT_ENABLED_KEY) ?? localStorage.getItem(LEGACY_CLOUDEE_ENABLED_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
};

export const setCloudeeEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(MASCOT_ENABLED_KEY, String(enabled));
    localStorage.setItem(LEGACY_CLOUDEE_ENABLED_KEY, String(enabled));
    window.dispatchEvent(new CustomEvent(CLOUDEE_STORAGE_EVENT, { detail: { enabled } }));
  } catch {
    // Ignore storage errors in restricted contexts
  }
};

export const useCloudeeEnabled = (): [boolean, (enabled: boolean) => void] => {
  const [enabled, setEnabledState] = useState<boolean>(() => isCloudeeEnabled());

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.enabled === 'boolean') {
        setEnabledState(customEvent.detail.enabled);
      } else {
        setEnabledState(isCloudeeEnabled());
      }
    };

    window.addEventListener(CLOUDEE_STORAGE_EVENT, handleToggle);
    window.addEventListener('storage', handleToggle);

    return () => {
      window.removeEventListener(CLOUDEE_STORAGE_EVENT, handleToggle);
      window.removeEventListener('storage', handleToggle);
    };
  }, []);

  const toggle = useCallback((nextVal: boolean) => {
    setEnabledState(nextVal);
    setCloudeeEnabled(nextVal);
  }, []);

  return [enabled, toggle];
};
