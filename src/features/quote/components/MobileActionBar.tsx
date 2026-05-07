type MobileActionBarProps = {
  onNew: () => void
  onDuplicate: () => void
  onSave: () => void
  onPrint: () => void
  disabled: boolean
  duplicateDisabled: boolean
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] grid grid-cols-2 gap-2 md:hidden print:hidden">
      <button
        onClick={onNew}
        className="active:scale-95 transition-transform duration-100 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium"
      >
        New
      </button>

      <button
        onClick={onDuplicate}
        disabled={duplicateDisabled}
        className="active:scale-95 transition-transform duration-100 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded text-sm font-medium"
      >
        Duplicate
      </button>

      <button
        onClick={onSave}
        disabled={disabled}
        className="active:scale-95 transition-transform duration-100 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
      >
        Save
      </button>

      <button
        onClick={onPrint}
        disabled={disabled}
        className="active:scale-95 transition-transform duration-100 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
      >
        Print
      </button>
    </div>
  )
}