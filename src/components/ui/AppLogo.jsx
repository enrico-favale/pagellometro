function AppLogo({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/15 ring-1 ring-inset ring-brand-primary/25">
        <span className="text-lg font-black text-brand-primary">P</span>
      </div>

      <div className="text-left">
        <p className="text-base font-black tracking-tight text-app-text">
          Pagellometro
        </p>
        <p className="text-xs text-app-text-muted">Sport, voti e sfide</p>
      </div>
    </div>
  )
}

export default AppLogo