type MobileActionBarProps = {
  onNew: () => void
  onSave: () => void
  onPrint: () => void
  disabled: boolean
}

export function MobileActionBar({
  onNew,
  onSave,
  onPrint,
  disabled,
}: MobileActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] flex gap-2 sm:hidden print:hidden">
      <button
        onClick={onNew}
        className="flex-1 active:scale-95 transition-transform duration-100 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium"
      >
        New
      </button>

      <button
        onClick={onSave}
        disabled={disabled}
        className="flex-1 active:scale-95 transition-transform duration-100 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
      >
        Save
      </button>

      <button
        onClick={onPrint}
        disabled={disabled}
        className="flex-1 active:scale-95 transition-transform duration-100 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium"
      >
        Export
      </button>
    </div>
  )
}