type TopBarProps = {
  quoteNumber: string
  onNew: () => void
  onDuplicate: () => void
  onSave: () => void
  onPrint: () => void
  canDuplicate: boolean
  canSave: boolean
}

export function TopBar({
  quoteNumber,
  onNew,
  onDuplicate,
  onSave,
  onPrint,
  canDuplicate,
  canSave,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 print:hidden bg-[#f5f6f8] py-2">
      <div className="max-w-screen-xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center">

        {/* Left: Logo */}
        <img
          src="/SnapQuote (no bckgnd).png"
          alt="SnapQuote Logo"
          className="h-8 w-auto object-contain"
        />

        {/* Right: Actions + Quote Number */}
        <div className="ml-auto flex items-center gap-3">

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onNew}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm shadow-sm"
            >
              New
            </button>

            <button
              onClick={onDuplicate}
              disabled={!canDuplicate}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm shadow-sm disabled:opacity-50"
            >
              Duplicate
            </button>

            <button
              onClick={onSave}
              disabled={!canSave}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm shadow-sm disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={onPrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm shadow-sm"
            >
              Print
            </button>
          </div>

          {/* Quote Number */}
          <span className="text-sm text-gray-500">{quoteNumber}</span>
        </div>
      </div>
    </div>
  )
}