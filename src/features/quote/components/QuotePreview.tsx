import type { QuoteResult } from "../types"

/* =========================================================
   PROPS
========================================================= */
type QuotePreviewProps = {
  result: QuoteResult | null
  selectedQuoteId: number | null
  quoteNumber: string
  companyName: string
  companyPhone: string
  companyEmail: string
  companyAddress:string
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  quoteDate: string
  logoUrl: string | null
  discountAmount: string
  notes: string
  onNewQuote: () => void
  onDuplicateQuote: () => void
  onSaveQuote: () => void
  onPrint: () => void
  formatCurrency: (value: number) => string
  formatDisplayDate: (dateString: string) => string
}


/* =========================================================
   COMPONENT
========================================================= */
export function QuotePreview({
  result,
  selectedQuoteId,
  quoteNumber,
  companyName,
  companyPhone,
  companyEmail,
  companyAddress,
  customerName,
  customerPhone,
  customerEmail,
  address,
  quoteDate,
  logoUrl,
  discountAmount,
  notes,
  onNewQuote,
  onDuplicateQuote,
  onSaveQuote,
  onPrint,
  formatCurrency,
  formatDisplayDate,
}: QuotePreviewProps) {
  return (
    /* =====================================================
       MAIN PREVIEW SECTION
    ===================================================== */
    <section className="min-w-0 rounded-xl py-4 sm:py-6 px-0 sm:px-3 print:rounded-none print:py-0 print:px-0">

      {result ? (
        /* =================================================
           PRINTABLE QUOTE CONTAINER
        ================================================= */
        <div className="quote-print-area max-w-[850px] mx-auto space-y-4 border border-gray-200 bg-white text-black p-5 md:p-6 shadow-[0_12px_35px_rgba(15,23,42,0.18)] rounded-sm print:w-full print:max-w-full md:print:w-[7in] md:print:max-w-[7in] print:mx-auto print:overflow-visible print:border-0 print:shadow-none print:rounded-none print:p-4 print:bg-white print:text-[12px]">

          {/* EDIT MODE INDICATOR */}
          {selectedQuoteId && (
            <div className="mb-3 text-sm text-blue-400 font-medium print:hidden">
              Editing Quote {quoteNumber}
            </div>
          )}

          {/* =================================================
             ACTION BUTTONS (DESKTOP ONLY)
          =================================================
          <div className="hidden sm:flex sm:justify-end gap-3 mb-4 print:hidden">
            <button onClick={onNewQuote} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm shadow-sm">
              New Quote
            </button>

            <button
              onClick={onDuplicateQuote}
              disabled={!selectedQuoteId}
              className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded text-sm shadow-sm"
            >
              Duplicate
            </button>

            <button onClick={onSaveQuote} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm shadow-sm">
              Save Quote
            </button>

            <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm shadow-sm">
              Print / Save PDF
            </button>
          </div>
 */}
          {/* =================================================
            HEADER (Company + Customer + Logo)
          ================================================= */}
          <div className="mb-4 border-b border-gray-700 pb-4">
            {/* Top row: company branding + quote metadata */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start print:flex-row min-w-0">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-20 w-20 sm:h-20 sm:w-20 object-contain"
                  />
                )}

                <div className="space-y-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl print:text-xl font-bold tracking-tight leading-tight">
                    {companyName}
                  </h1>

                  {(companyPhone || companyEmail) && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      {companyPhone}
                      {companyPhone && companyEmail ? " • " : ""}
                      {companyEmail}
                    </p>
                  )}

                  {companyAddress && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      {companyAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right print:text-right text-[11px] sm:text-sm leading-snug shrink-0">
                <p>
                  <span className="text-gray-400 uppercase">Date:</span>{" "}
                  {formatDisplayDate(quoteDate)}
                </p>

                <p>
                  <span className="text-gray-400 uppercase">Quote #</span>{" "}
                  <span className="font-medium">{quoteNumber}</span>
                </p>
              </div>
            </div>

            {/* Bottom row: customer info */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-3 sm:pt-4 text-xs sm:text-sm">
              {/* CLIENT INFO */}
              <div className="space-y-1 break-words">
                <p className="text-gray-400 uppercase text-[10px] sm:text-xs">
                  Client
                </p>
                <p className="font-medium">{customerName}</p>

                {address && (
                  <div className="leading-snug">
                    <p className="break-words">
                      {address.split(",")[0]}
                    </p>

                    {address.includes(",") && (
                      <p className="break-words">
                        {address.split(",").slice(1).join(",").trim()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CUSTOMER CONTACT INFO */}
              <div className="space-y-1">
                <p className="text-gray-400 uppercase text-[10px] sm:text-xs">
                  Contact
                </p>

                {customerPhone && <p>{customerPhone}</p>}
                {customerEmail && <p>{customerEmail}</p>}
              </div>
            </div>
          </div>

          {/* =================================================
             SCOPE OF WORK
          ================================================= */}
          <div className="mt-6 print:mt-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Scope of Work
            </p>
            <p className="text-sm text-gray-400">
              {result.scopeOfWork}
            </p>
          </div>

          {/* =================================================
             LINE ITEMS TABLE
          ================================================= */}
          <table className="w-full text-sm border-collapse mt-6">
            <thead>
              <tr className="border-b text-gray-400 text-xs uppercase">
                <th className="text-left">Item</th>
                <th className="text-left">Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {/* All NON-haul items first */}
              {result.lineItems
                .filter((item) => !item.item.toLowerCase().includes("haul"))
                .map((item, index) => (
                  <tr key={`main-${index}`} className="border-b">
                    <td>{item.item}</td>
                    <td>{item.description}</td>
                    <td className="text-center">{item.quantity ?? "-"}</td>
                    <td className="text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}

              {/* Haul-Off LAST */}
              {result.lineItems
                .filter((item) => item.item.toLowerCase().includes("haul"))
                .map((item, index) => (
                  <tr key={`haul-${index}`} className="border-b">
                    <td>{item.item}</td>
                    <td>{item.description}</td>
                    <td className="text-center">{item.quantity ?? "-"}</td>
                    <td className="text-right">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* =================================================
             TOTALS SUMMARY
          ================================================= */}
          <div className="mt-6 print:mt-4 text-sm print:text-[11px] space-y-2 print:space-y-1 max-w-sm ml-auto border-t border-gray-300 pt-4 print:pt-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(result.subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Discount</span>
              <span>({formatCurrency(Number(discountAmount) || 0)})</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>After Discount</span>
              <span>{formatCurrency(result.subtotalAfterDiscount)}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Emergency{" "}
              <span className="text-xs text-gray-400">(25%)</span>
              </span>
              <span>{formatCurrency(result.emergencyFee)}</span>
            </div>

            <div className="flex justify-between font-medium text-gray-900 border-t pt-2">
              <span>Adjusted Subtotal</span>
              <span>{formatCurrency(result.adjustedSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax{" "}
              <span className="text-xs text-gray-400">(8.25%)</span>
              </span>
              <span>{formatCurrency(result.tax)}</span>
            </div>

            <div className="flex justify-between rounded-lg bg-gray-100 px-3 py-2 font-bold text-lg border-t">
              <span>Total</span>
              <span>{formatCurrency(result.total)}</span>
            </div>

            {/* =================================================
              NOTES / TERMS
              Optional customer-facing notes, payment terms,
              scheduling details, exclusions, etc.
            ================================================= */}
            {notes && (
              <div className="mt-6 border-t border-gray-300 pt-4">
                
                {/* Section title */}
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Notes / Terms
                </p>

                {/* Notes content */}
                <p className="whitespace-pre-line text-sm text-gray-700">
                  {notes}
                </p>
              </div>
            )}

            {/* Powered-by branding shown under quote totals */}
            <div className="pt-2 text-right text-[8px] text-gray-500 italic opacity-70">
              <span className="mr-2">Powered by</span>
              <img
                src="/logo2.png"
                alt="SnapQuote Logo"
                className="inline-block h-3 w-auto opacity-70 align-middle"
              />
            </div>
          </div>
        </div>
      ) : (
        

        /* =================================================
           EMPTY STATE
        ================================================= */
        <div className="flex min-h-[320px] items-center justify-center border rounded p-10 text-gray-400 text-center">
          Select a base service and enter the required quantity to preview the quote.
        </div>
      )}
    </section>
  )
}