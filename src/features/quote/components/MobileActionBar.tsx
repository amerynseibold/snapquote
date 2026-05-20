type MobileActionBarProps = {
  onNew: () => void
  onDuplicate: () => void
  onSave: () => void
  onPrint: () => void
  disabled: boolean
  duplicateDisabled: boolean
}

type MobileActionIcon = "new" | "duplicate" | "save" | "print"

function ActionIcon({ icon }: { icon: MobileActionIcon }) {
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

function MobileButton({
  label,
  icon,
  onClick,
  disabled = false,
  className,
}: {
  label: string
  icon: MobileActionIcon
  onClick: () => void
  disabled?: boolean
  className: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-transform duration-100 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/5">
        <ActionIcon icon={icon} />
      </span>
      {label}
    </button>
  )
}

export function MobileActionBar({
  onNew,
  onDuplicate,
  onSave,
  onPrint,
  disabled,
  duplicateDisabled,
}: MobileActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-2 gap-2 border-t border-gray-200 bg-white/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-14px_34px_rgba(15,23,42,0.12)] backdrop-blur md:hidden print:hidden">
      <MobileButton
        label="New"
        icon="new"
        onClick={onNew}
        className="border border-gray-200 bg-white text-gray-800"
      />

      <MobileButton
        label="Duplicate"
        icon="duplicate"
        onClick={onDuplicate}
        disabled={duplicateDisabled}
        className="border border-gray-200 bg-white text-gray-800"
      />

      <MobileButton
        label="Save"
        icon="save"
        onClick={onSave}
        disabled={disabled}
        className="bg-[#5f9534] text-white"
      />

      <MobileButton
        label="Print"
        icon="print"
        onClick={onPrint}
        disabled={disabled}
        className="bg-[#101522] text-white"
      />
    </div>
  )
}
