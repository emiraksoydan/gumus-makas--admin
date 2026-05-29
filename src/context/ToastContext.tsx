import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useRef,

  useState,

  type ReactNode,

} from "react";

import {

  AlertIcon,

  CheckCircleIcon,

  CloseIcon,

  ErrorIcon,

  InfoIcon,

} from "../icons";



export type ToastVariant = "success" | "error" | "warning" | "info";



export interface ToastItem {

  id: string;

  message: string;

  variant: ToastVariant;

}



interface ToastContextValue {

  showToast: (message: string, variant?: ToastVariant) => void;

  success: (message: string) => void;

  error: (message: string) => void;

  warning: (message: string) => void;

}



const ToastContext = createContext<ToastContextValue | null>(null);



const VARIANT_CONFIG: Record<

  ToastVariant,

  {

    panel: string;

    iconWrap: string;

    Icon: typeof CheckCircleIcon;

  }

> = {

  success: {

    panel:

      "border-success-500 bg-success-50 text-success-950 shadow-success-500/20 dark:border-success-400 dark:bg-success-500/20 dark:text-success-50",

    iconWrap: "bg-success-600 text-white dark:bg-success-500",

    Icon: CheckCircleIcon,

  },

  error: {

    panel:

      "border-error-500 bg-error-50 text-error-950 shadow-error-500/20 dark:border-error-400 dark:bg-error-500/20 dark:text-error-50",

    iconWrap: "bg-error-600 text-white dark:bg-error-500",

    Icon: ErrorIcon,

  },

  warning: {

    panel:

      "border-warning-500 bg-warning-50 text-warning-950 shadow-warning-500/20 dark:border-warning-400 dark:bg-warning-500/20 dark:text-warning-50",

    iconWrap: "bg-warning-600 text-white dark:bg-warning-500",

    Icon: AlertIcon,

  },

  info: {

    panel:

      "border-brand-500 bg-brand-50 text-brand-950 shadow-brand-500/20 dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-50",

    iconWrap: "bg-brand-600 text-white dark:bg-brand-500",

    Icon: InfoIcon,

  },

};



export function ToastProvider({ children }: { children: ReactNode }) {

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());



  const dismiss = useCallback((id: string) => {

    const timer = timersRef.current.get(id);

    if (timer) {

      clearTimeout(timer);

      timersRef.current.delete(id);

    }

    setToasts((prev) => prev.filter((t) => t.id !== id));

  }, []);



  const showToast = useCallback(

    (message: string, variant: ToastVariant = "info") => {

      const id = crypto.randomUUID();

      setToasts((prev) => [...prev, { id, message, variant }]);

      const timer = setTimeout(() => dismiss(id), 4500);

      timersRef.current.set(id, timer);

    },

    [dismiss],

  );



  const value = useMemo(

    () => ({

      showToast,

      success: (message: string) => showToast(message, "success"),

      error: (message: string) => showToast(message, "error"),

      warning: (message: string) => showToast(message, "warning"),

    }),

    [showToast],

  );



  return (

    <ToastContext.Provider value={value}>

      {children}

      <div

        className="pointer-events-none fixed top-4 right-4 z-[99999] flex w-full max-w-md flex-col gap-3 px-4 sm:px-0"

        aria-live="polite"

        aria-relevant="additions"

      >

        {toasts.map((toast) => {

          const { panel, iconWrap, Icon } = VARIANT_CONFIG[toast.variant];

          return (

            <div

              key={toast.id}

              role="status"

              className={`pointer-events-auto animate-toast-in flex items-center gap-3 rounded-xl border-2 border-l-[6px] px-4 py-3.5 text-sm font-medium shadow-theme-lg ${panel}`}

            >

              <span

                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${iconWrap}`}

                aria-hidden

              >

                <Icon className="size-5 [&_path]:fill-current [&_circle]:fill-current" />

              </span>

              <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>

              <button

                type="button"

                onClick={() => dismiss(toast.id)}

                className="shrink-0 rounded-lg p-1 opacity-70 transition-all duration-500 ease-in-out hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"

                aria-label="Kapat"

              >

                <CloseIcon className="size-4" />

              </button>

            </div>

          );

        })}

      </div>

    </ToastContext.Provider>

  );

}



export function useToast() {

  const ctx = useContext(ToastContext);

  if (!ctx) throw new Error("useToast must be used within ToastProvider");

  return ctx;

}


