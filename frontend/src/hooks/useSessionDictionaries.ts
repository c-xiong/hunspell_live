import { useCallback, useState } from 'react';

// Dictionaries uploaded for this browsing session. The backend keeps them in
// memory with a sliding TTL; we mirror the ids in sessionStorage so they
// survive a page refresh (until they expire server-side).

export interface SessionDictionary {
  id: string;
  name: string;
  direction: 'ltr' | 'rtl';
  expiresAt: number; // epoch ms — optimistic client-side estimate
}

const STORAGE_KEY = 'sessionDictionaries';

const read = (): SessionDictionary[] => {
  try {
    const list: SessionDictionary[] = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) || '[]'
    );
    return list.filter((d) => d.expiresAt > Date.now());
  } catch {
    return [];
  }
};

const write = (list: SessionDictionary[]) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const useSessionDictionaries = () => {
  const [sessionDictionaries, setSessionDictionaries] = useState<SessionDictionary[]>(read);

  const addSessionDictionary = useCallback(
    (id: string, name: string, direction: 'ltr' | 'rtl', expiresInSeconds: number) => {
      const entry: SessionDictionary = {
        id,
        name,
        direction,
        expiresAt: Date.now() + expiresInSeconds * 1000,
      };
      const list = [...read().filter((d) => d.id !== id), entry];
      write(list);
      setSessionDictionaries(list);
      return entry;
    },
    []
  );

  const removeSessionDictionary = useCallback((id: string) => {
    const list = read().filter((d) => d.id !== id);
    write(list);
    setSessionDictionaries(list);
  }, []);

  return { sessionDictionaries, addSessionDictionary, removeSessionDictionary };
};
