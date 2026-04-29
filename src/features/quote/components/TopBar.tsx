type TopBarProps = {
  quoteNumber: string
}

export function TopBar({ quoteNumber }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 px-3 sm:px-4 py-2 flex justify-between items-center shadow-sm print:hidden">
      <div className="flex items-center">
        <img
          src="/SnapQuote (no bckgnd).png"
          alt="SnapQuote Logo"
          className="h-7 sm:h-8 md:h-9 w-auto object-contain -ml-1"
        />
      </div>

      {quoteNumber && (
        <span className="text-sm text-gray-500">{quoteNumber}</span>
      )}
    </div>
  )
}