import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-brand-primary text-slate-50 hover:bg-brand-primary-hover focus-visible:outline-brand-primary',
  secondary:
    'bg-app-surface-2 text-app-text ring-1 ring-inset ring-app-border hover:bg-slate-800 focus-visible:outline-brand-primary',
  ghost:
    'bg-transparent text-app-text ring-1 ring-inset ring-app-border hover:bg-app-surface-2 focus-visible:outline-brand-primary',
}

function AppButton({
  to,
  children,
  variant = 'primary',
  type = 'button',
  className = '',
}) {
  const classes = [
    'inline-flex min-h-11 w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    variants[variant],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  )
}

export default AppButton