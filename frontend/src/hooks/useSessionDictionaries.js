import { useCallback, useState } from 'react';
const STORAGE_KEY = 'sessionDictionaries';
const read = () => {
    try {
        const list = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
        return list.filter((d) => d.expiresAt > Date.now());
    }
    catch (_a) {
        return [];
    }
};
const write = (list) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};
export const useSessionDictionaries = () => {
    const [sessionDictionaries, setSessionDictionaries] = useState(read);
    const addSessionDictionary = useCallback((id, name, direction, expiresInSeconds) => {
        const entry = {
            id,
            name,
            direction,
            expiresAt: Date.now() + expiresInSeconds * 1000,
        };
        const list = [...read().filter((d) => d.id !== id), entry];
        write(list);
        setSessionDictionaries(list);
        return entry;
    }, []);
    const removeSessionDictionary = useCallback((id) => {
        const list = read().filter((d) => d.id !== id);
        write(list);
        setSessionDictionaries(list);
    }, []);
    return { sessionDictionaries, addSessionDictionary, removeSessionDictionary };
};
