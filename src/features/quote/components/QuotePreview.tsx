import type { QuoteResult } from "../types"

/* =========================================================
   PROPS
========================================================= */
type QuotePreviewProps = {
  result: QuoteResult | null
  selectedQuoteId: number | null
  quoteNumber: string
  companyName: string
  customerName: string
  customerPhone: string
  customerEmail: string
  address: string
  quoteDate: string
  logoUrl: string | null
  discountAmount: string
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
  customerName,
  customerPhone,
  customerEmail,
  address,
  quoteDate,
  logoUrl,
  discountAmount,
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
        <div className="quote-print-area max-w-[850px] mx-auto space-y-4 border border-gray-200 bg-white text-black p-5 md:p-6 shadow-[0_12px_35px_rgba(15,23,42,0.18)] rounded-sm print:w-full print:max-w-full md:print:w-[7in] md:print:max-w-[7in] print:mx-auto print:overflow-visible print:border-0 print:shadow-none print:rounded-none print:p-0 print:bg-white">

          {/* EDIT MODE INDICATOR */}
          {selectedQuoteId && (
            <div className="mb-3 text-sm text-blue-400 font-medium print:hidden">
              Editing Quote {quoteNumber}
            </div>
          )}

          {/* =================================================
             ACTION BUTTONS (DESKTOP ONLY)
          ================================================= */}
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

          {/* =================================================
             HEADER (Company + Customer + Logo)
          ================================================= */}
          <div className="mb-4 border-b border-gray-700 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
              {companyName}
            </h1>

            <div className="grid grid-cols-[1fr_1fr_56px] sm:grid-cols-[1.2fr_1fr_120px] gap-2 sm:gap-8 border-t border-gray-700 pt-3 sm:pt-4 text-xs sm:text-sm">

              {/* CLIENT INFO */}
              <div className="space-y-1 text-xs sm:text-sm break-words">
                <p className="text-gray-400 uppercase text-xs sm:text-sm">Client</p>
                <p className="font-medium">{customerName}</p>

                {address && (
                  <p className="break-words leading-snug">
                    {address}
                  </p>
                )}
              </div>

              {/* QUOTE DETAILS */}
              <div className="space-y-1 text-xs sm:text-sm break-words">
                <p>
                  <span className="text-gray-400 text-xs uppercase">Date:</span>{" "}
                  {formatDisplayDate(quoteDate)}
                </p>

                <p>
                  <span className="text-gray-400 text-xs uppercase">Quote #</span>{" "}
                  <span className="font-medium">{quoteNumber}</span>
                </p>

                {customerPhone && <p>{customerPhone}</p>}
                {customerEmail && <p>{customerEmail}</p>}
              </div>

              {/* LOGO */}
              <div className="flex justify-end items-center">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="max-h-24 object-contain"
                  />
                )}
              </div>
            </div>
          </div>

          {/* =================================================
             SCOPE OF WORK
          ================================================= */}
          <div>
            <p className="font-semibold">Scope of Work:</p>
            <p className="text-sm text-gray-400">
              {result.scopeOfWork}
            </p>
          </div>

          {/* =================================================
             LINE ITEMS TABLE
          ================================================= */}
          <table className="w-full text-sm border-collapse mt-3">
            <thead>
              <tr className="border-b text-gray-400 text-xs uppercase">
                <th className="text-left">Item</th>
                <th className="text-left">Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {result.lineItems.map((item, index) => (
                <tr key={index} className="border-b">
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
          <div className="mt-4 text-sm space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(result.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>({formatCurrency(Number(discountAmount) || 0)})</span>
            </div>

            <div className="flex justify-between">
              <span>After Discount</span>
              <span>{formatCurrency(result.subtotalAfterDiscount)}</span>
            </div>

            <div className="flex justify-between">
              <span>Emergency</span>
              <span>{formatCurrency(result.emergencyFee)}</span>
            </div>

            <div className="flex justify-between font-medium border-t pt-2">
              <span>Adjusted Subtotal</span>
              <span>{formatCurrency(result.adjustedSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(result.tax)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(result.total)}</span>
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