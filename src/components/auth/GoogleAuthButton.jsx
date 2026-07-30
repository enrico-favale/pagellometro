function GoogleAuthButton({ onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl border border-app-border bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <img
        src="/google-g-logo.png"
        alt=""
        aria-hidden="true"
        className="h-[18px] w-[18px]"
      />
      <span>{children}</span>
    </button>
  )
}

export default GoogleAuthButton