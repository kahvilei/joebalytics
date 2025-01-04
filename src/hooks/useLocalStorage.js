import { useState } from 'react';

export function useLocalStorage(key, initialValue, expirationTime = 24 * 60 * 60 * 1000) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            const timestampStr = localStorage.getItem(`${key}Timestamp`);

            if (item && timestampStr) {
                const timestamp = parseInt(timestampStr);
                if (Date.now() - timestamp < expirationTime) {
                    return JSON.parse(item);
                }
            }
            return initialValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);
            localStorage.setItem(key, JSON.stringify(value));
            localStorage.setItem(`${key}Timestamp`, Date.now().toString());
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };

    return [storedValue, setValue];
}