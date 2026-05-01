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
    <>
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-40 print:hidden bg-[#f5f6f8] px-3 py-2">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 flex items-center justify-between">
          <img
            src="/SnapQuote (no bckgnd).png"
            alt="SnapQuote Logo"
            className="h-7 w-auto object-contain"
          />

          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {quoteNumber}
          </span>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block sticky top-0 z-40 print:hidden bg-[#f5f6f8] py-2">
        <div className="w-full max-w-screen-xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex items-center">
          <img
            src="/SnapQuote (no bckgnd).png"
            alt="SnapQuote Logo"
            className="h-8 w-auto object-contain"
          />

          <div className="ml-auto flex items-center gap-3">
            <div className="flex gap-2">
              <button onClick={onNew} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm shadow-sm">
                New
              </button>

              <button onClick={onDuplicate} disabled={!canDuplicate} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm shadow-sm disabled:opacity-50">
                Duplicate
              </button>

              <button onClick={onSave} disabled={!canSave} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm shadow-sm disabled:opacity-50">
                Save
              </button>

              <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm shadow-sm">
                Print
              </button>
            </div>

            <span className="text-sm text-gray-500 whitespace-nowrap">
              {quoteNumber}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}