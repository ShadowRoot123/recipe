import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ErrorContextType {
    error: string | null;
    showError: (message: string) => void;
    hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState<string | null>(null);

    const showError = useCallback((message: string) => {
        setError(message);
        // Auto-hide after 5 seconds
        setTimeout(() => {
            setError(null);
        }, 5000);
    }, []);

    const hideError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <ErrorContext.Provider value={{ error, showError, hideError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};
