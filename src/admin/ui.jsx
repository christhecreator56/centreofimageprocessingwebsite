import React from 'react';

/* Shared primitives for the console. Deliberately plain: the public site is
 * the showpiece, the admin should be fast to read and fast to fill in. */

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const baseInput =
  'w-full rounded-xl border border-ink/15 bg-background px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-muted/70 focus:border-ink/40';

export const Input = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} className={`${baseInput} ${props.className || ''}`} />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} {...props} className={`${baseInput} resize-y ${props.className || ''}`} />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef((props, ref) => (
  <select ref={ref} {...props} className={`${baseInput} ${props.className || ''}`} />
));
Select.displayName = 'Select';

export function Button({ variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-ink text-background hover:opacity-85',
    ghost: 'border border-ink/15 text-ink hover:bg-ink/5',
    danger: 'border border-red-500/40 text-red-500 hover:bg-red-500/10',
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 disabled:pointer-events-none disabled:opacity-45 ${styles} ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          checked ? 'bg-ink' : 'bg-ink/20'
        }`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: checked ? 22 : 2 }}
        />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
    </button>
  );
}

export function Panel({ title, action, children }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-5 md:p-6">
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium tracking-tight text-ink">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function Banner({ kind = 'error', children, onDismiss }) {
  if (!children) return null;
  const tone =
    kind === 'error'
      ? 'border-red-500/40 bg-red-500/10 text-red-500'
      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500';
  return (
    <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${tone}`}>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="opacity-70">
          ✕
        </button>
      )}
    </div>
  );
}
