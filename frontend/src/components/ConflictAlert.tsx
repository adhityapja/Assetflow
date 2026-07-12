interface ConflictAlertProps {
  type: 409 | 400 | 'generic';
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const CONFIG = {
  409: {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    label: 'Conflict Detected',
    badge: 'HTTP 409',
    styles: {
      container: 'bg-red-950/50 border border-red-500/40',
      accent: 'bg-red-500',
      icon: 'text-red-400',
      title: 'text-red-300',
      message: 'text-red-200',
      badge: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
    },
  },
  400: {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Invalid State Transition',
    badge: 'HTTP 400',
    styles: {
      container: 'bg-amber-950/50 border border-amber-500/40',
      accent: 'bg-amber-500',
      icon: 'text-amber-400',
      title: 'text-amber-300',
      message: 'text-amber-200',
      badge: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
    },
  },
  generic: {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    label: 'Request Failed',
    badge: 'ERROR',
    styles: {
      container: 'bg-slate-800/60 border border-slate-600/40',
      accent: 'bg-slate-500',
      icon: 'text-slate-400',
      title: 'text-slate-300',
      message: 'text-slate-400',
      badge: 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30',
    },
  },
};

export function ConflictAlert({ type, message, onDismiss, action }: ConflictAlertProps) {
  const cfg = CONFIG[type];
  const { styles } = cfg;

  return (
    <div className={`relative flex gap-3 rounded-xl p-4 panel-enter overflow-hidden ${styles.container}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${styles.accent}`} />

      {/* Icon */}
      <div className={`mt-0.5 ${styles.icon}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-semibold ${styles.title}`}>{cfg.label}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${styles.badge}`}>
            {cfg.badge}
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${styles.message}`}>{message}</p>

        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            {action.label} →
          </button>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`self-start mt-0.5 ${styles.icon} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
