import constants from '../constants';
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import type { ReactNode } from 'react';
import type { Person } from '../types';
import { getMe } from '../services/persons';

interface SessionContextType {
    person:          Person | null;
    isLoading:       boolean;
    isAuthenticated: boolean;
    logout:          () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {

    const [person, setPerson] = useState<Person | null>(() => {
        try {
            const cached = sessionStorage.getItem('session_person');
            return cached ? (JSON.parse(cached) as Person) : null;
        } catch {
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(!person);

    useEffect(() => {
    if (person) return;

    // ← ADD THIS CHECK
    const token = localStorage.getItem(constants.ACCESS_TOKEN);
    if (!token) {
        setIsLoading(false);
        return;
    }

    getMe()
        .then(res => {
            const fetchedPerson = res.data.data.user;
            setPerson(fetchedPerson);
            sessionStorage.setItem('session_person', JSON.stringify(fetchedPerson));
        })
        .catch(() => {
            sessionStorage.removeItem('session_person');
            localStorage.removeItem('access_token');
        })
        .finally(() => setIsLoading(false));
    }, []);

    function logout() {
        sessionStorage.removeItem('session_person');
        localStorage.removeItem('access_token');
        setPerson(null);
    }

    return (
        <SessionContext.Provider
            value={{ person, isLoading, isAuthenticated: !!person, logout }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionContextType {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
    return ctx;
}
