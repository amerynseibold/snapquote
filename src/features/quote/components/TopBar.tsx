type TopBarProps = {
  quoteNumber: string
}

export function TopBar({ quoteNumber }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 print:hidden bg-[#f5f6f8] py-2">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 flex justify-between items-center">
        <img
          src="/SnapQuote (no bckgnd).png"
          alt="SnapQuote Logo"
          className="h-8 w-auto object-contain"
        />

        {quoteNumber && (
          <span className="text-sm text-gray-500">{quoteNumber}</span>
        )}
      </div>
    </div>
  )
}