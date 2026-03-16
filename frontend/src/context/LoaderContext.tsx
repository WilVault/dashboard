import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface LoaderContextType {
    isLoading: boolean;
    message:   string;
    show:      (message?: string) => void;
    hide:      () => void;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

function Spinner() {
    return (
        <svg
            className="size-10 animate-spin text-white/80"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
}

// ─── Full-screen overlay ──────────────────────────────────────────────────────

function LoaderOverlay({ message }: { message: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-label={message || 'Loading'}
            className="
                fixed inset-0 z-[9999]
                flex flex-col items-center justify-center gap-4
                bg-black/60 backdrop-blur-sm
                animate-in fade-in duration-200
            "
        >
            <Spinner />
            {message && (
                <p className="text-sm font-medium tracking-wide text-[#C9FA30]">
                    {message}
                </p>
            )}
        </div>
    );
}

export function LoaderProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message,   setMessage]   = useState('');

    const show = useCallback((msg = '') => {
        setMessage(msg);
        setIsLoading(true);
    }, []);

    const hide = useCallback(() => {
        setIsLoading(false);
        setMessage('');
    }, []);

    return (
        <LoaderContext.Provider value={{ isLoading, message, show, hide }}>
            {children}
            {isLoading && <LoaderOverlay message={message} />}
        </LoaderContext.Provider>
    );
}

export function useLoader(): LoaderContextType {
    const ctx = useContext(LoaderContext);
    if (!ctx) throw new Error('useLoader must be used inside <LoaderProvider>');
    return ctx;
}







/*
    How to use this anywhere

    import useLoader()

    const { show, hide } = useLoader();


    show with optional message...

    show('Saving changes…');
    await someAsyncCall();
    hide();

    or no message — just the spinner
    show();
*/