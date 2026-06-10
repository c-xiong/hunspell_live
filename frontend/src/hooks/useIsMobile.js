import { useEffect, useState } from 'react';
// Tailwind "sm" breakpoint — below this, popups become bottom sheets.
const QUERY = '(max-width: 639px)';
export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);
    useEffect(() => {
        const mql = window.matchMedia(QUERY);
        const onChange = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);
    return isMobile;
};
