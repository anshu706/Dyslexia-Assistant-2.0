import { useState, useEffect, useCallback } from 'react';

/**
 * Schema-versioned LocalStorage hook with graceful error recovery and cross-tab synchronization.
 * @param {string} key - Local storage key
 * @param {any} initialValue - Default fallback value
 * @param {number} schemaVersion - Version of the data schema
 */
export function useLocalStorage(key, initialValue, schemaVersion = 1) {
  // Read value safely from localStorage
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      const parsed = JSON.parse(item);

      // Check schema version wrapper
      if (parsed && typeof parsed === 'object' && '_schemaVersion' in parsed) {
        if (parsed._schemaVersion === schemaVersion) {
          return parsed.data;
        } else {
          // Schema version mismatch - gracefully return initialValue and preserve old in backup
          console.warn(`[useLocalStorage] Schema version mismatch for key "${key}". Resetting to default.`);
          try {
            window.localStorage.setItem(`${key}_backup_v${parsed._schemaVersion}`, item);
          } catch (e) {
            // ignore backup failure
          }
          return initialValue;
        }
      }

      // Legacy or unversioned payload: wrap safely
      return parsed;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, schemaVersion]);

  const [storedValue, setStoredValue] = useState(readValue);

  // Set value safely in localStorage
  const setValue = useCallback((value) => {
    if (typeof window === 'undefined') return;

    try {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        const payload = {
          _schemaVersion: schemaVersion,
          data: valueToStore,
          updatedAt: Date.now(),
        };
        window.localStorage.setItem(key, JSON.stringify(payload));
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('dyslexia_storage_change', { detail: { key, value: valueToStore } }));
        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Error writing key "${key}":`, error);
    }
  }, [key, schemaVersion]);

  // Sync across storage events (tabs / windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed._schemaVersion === schemaVersion) {
            setStoredValue(parsed.data);
          }
        } catch {
          // ignore parse errors
        }
      }
    };

    const handleCustomChange = (e) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dyslexia_storage_change', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dyslexia_storage_change', handleCustomChange);
    };
  }, [key, schemaVersion]);

  return [storedValue, setValue];
}
