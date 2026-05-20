type ActivePage = "quotes" | "history" | "settings"

type TopBarProps = {
  quoteNumber: string
  activePage: ActivePage
  savedQuoteCount: number
  onPageChange: (page: ActivePage) => void
  onNew: () => void
  onDuplicate: () => void
  onSave: () => void
  onPrint: () => void
  canDuplicate: boolean
  canSave: boolean
}

type ToolbarButtonProps = {
  label: string
  icon: "new" | "duplicate" | "save" | "print"
  onClick: () => void
  disabled?: boolean
  tone?: "primary" | "success" | "neutral"
}

function ToolbarIcon({ icon }: { icon: ToolbarButtonProps["icon"] }) {
  const iconClass = "h-4 w-4"

  if (icon === "new") {
    return (
      <svg className={iconClass} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (icon === "duplicate") {
    return (
      <svg className={iconClass} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 6.5V5.25A2.25 2.25 0 0 1 9.75 3h4A2.25 2.25 0 0 1 16 5.25v4a2.25 2.25 0 0 1-2.25 2.25H12.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="7.5" width="8.5" height="8.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  if (icon === "save") {
    return (
      <svg className={iconClass} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="m5 10.25 3.15 3.15L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg className={iconClass} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 7V3.75h8V7M6.5 14.25H5A2 2 0 0 1 3 12.25V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3.25a2 2 0 0 1-2 2h-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 11.5h7v5h-7v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.5 9.75h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ToolbarButton({
  label,
  icon,
  onClick,
  disabled = false,
  tone = "neutral",
}: ToolbarButtonProps) {
  const toneClasses = {
    primary:
      "border-[#101522] bg-[#101522] text-white hover:bg-[#1a2133] disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
    success:
      "border-[#5f9534] bg-[#5f9534] text-white hover:bg-[#527f2f] disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400",
    neutral:
      "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:text-gray-400",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 min-w-[92px] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed ${toneClasses[tone]}`}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center rounded-md bg-black/5"
      >
        <ToolbarIcon icon={icon} />
      </span>
      {label}
    </button>
  )
}

function PageMenu({
  activePage,
  savedQuoteCount,
  onPageChange,
}: {
  activePage: ActivePage
  savedQuoteCount: number
  onPageChange: (page: ActivePage) => void
}) {
  return (
    <label className="group flex h-10 items-center overflow-hidden rounded-xl border border-[#d9dfd1] bg-white shadow-sm transition-colors hover:border-[#b9c8ac]">
      <span className="flex h-full items-center border-r border-[#d9dfd1] bg-[#f8faf5] px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        View
      </span>

      <span className="relative flex h-full items-center">
        <select
          value={activePage}
          onChange={(event) => onPageChange(event.target.value as ActivePage)}
          className="h-full min-w-[136px] appearance-none bg-white pl-4 pr-9 text-sm font-semibold text-gray-900 outline-none transition focus:bg-[#f8faf5]"
        >
          <option value="quotes">Quote Builder</option>
          <option value="history">History ({savedQuoteCount})</option>
          <option value="settings">Settings</option>
        </select>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 h-2 w-2 rotate-45 border-b border-r border-gray-400 transition-colors group-hover:border-[#5f9534]"
        />
      </span>
    </label>
  )
}

export function TopBar({
  quoteNumber,
  activePage,
  savedQuoteCount,
  onPageChange,
  onNew,
  onDuplicate,
  onSave,
  onPrint,
  canDuplicate,
  canSave,
}: TopBarProps) {
  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 print:hidden bg-[#f6f7f4]/95 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d9dfd1] bg-white px-3 py-2 shadow-sm">
          <img
            src="/SnapQuote (no bckgnd).png"
            alt="SnapQuote Logo"
            className="h-7 w-auto object-contain"
          />

          <div className="flex items-center gap-2">
            <PageMenu
              activePage={activePage}
              savedQuoteCount={savedQuoteCount}
              onPageChange={onPageChange}
            />

            <span className="hidden rounded-full border border-[#d9dfd1] bg-[#f8faf5] px-2.5 py-1 text-xs font-semibold text-gray-600 min-[440px]:inline">
              {quoteNumber || "New quote"}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block sticky top-0 z-40 print:hidden bg-[#f6f7f4]/95 py-2 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-xl items-center rounded-xl border border-[#d9dfd1] bg-white px-4 py-2 shadow-sm">
          <img
            src="/SnapQuote (no bckgnd).png"
            alt="SnapQuote Logo"
            className="h-8 w-auto object-contain"
          />

          <div className="ml-auto flex items-center gap-4">
            <PageMenu
              activePage={activePage}
              savedQuoteCount={savedQuoteCount}
              onPageChange={onPageChange}
            />

            <div className="flex items-center gap-2 rounded-xl border border-[#d9dfd1] bg-[#f8faf5] p-1">
              <ToolbarButton label="New" icon="new" onClick={onNew} />
              <ToolbarButton
                label="Duplicate"
                icon="duplicate"
                onClick={onDuplicate}
                disabled={!canDuplicate}
              />
              <ToolbarButton
                label="Save"
                icon="save"
                onClick={onSave}
                disabled={!canSave}
                tone="success"
              />
              <ToolbarButton
                label="Print"
                icon="print"
                onClick={onPrint}
                disabled={!canSave}
                tone="primary"
              />
            </div>

            <span className="rounded-full border border-[#d9dfd1] bg-[#f8faf5] px-3 py-1 text-sm font-semibold text-gray-600">
              {quoteNumber || "New quote"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
