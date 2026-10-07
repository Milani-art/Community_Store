import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle, error: XCircle, info: Info };

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (type, message, duration) => {
            const id = nextId.current++;
            setToasts((prev) => [...prev, { id, type, message }]);
            setTimeout(() => dismiss(id), duration);
        },
        [dismiss]
    );

    // Stable object so consumers using it in effect deps don't re-run every render.
    const toast = useMemo(
        () => ({
            success: (message) => push('success', message, 4000),
            error: (message) => push('error', message, 6000),
            info: (message) => push('info', message, 4000),
        }),
        [push]
    );

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => {
                    const Icon = ICONS[t.type];
                    return (
                        <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{t.message}</span>
                            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);