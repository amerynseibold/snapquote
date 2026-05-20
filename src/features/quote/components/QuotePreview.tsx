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
        <div className="quote-print-area mx-auto max-w-[850px] space-y-4 rounded-sm border border-gray-200 bg-white p-5 text-black shadow-[0_18px_55px_rgba(15,23,42,0.16)] ring-1 ring-black/[0.02] md:p-7 print:mx-auto print:w-[7in] print:max-w-[7in] print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-2 print:text-[10px] print:leading-tight print:shadow-none print:ring-0">

          {/* EDIT MODE INDICATOR */}
          {selectedQuoteId && (
            <div className="mb-3 text-sm text-[#5f9534] font-medium print:hidden">
              Editing Quote {quoteNumber}
            </div>
          )}

          {/* =================================================
            HEADER (Company + Customer + Logo)
          ================================================= */}
          <div className="mb-4 border-b border-gray-300 pb-4">
            {/* Top row: company branding + quote metadata */}
            <div className="mb-4 flex flex-col gap-4 border border-[#d9dfd1] bg-[#f8faf5] px-4 py-4 print:flex-row print:items-start print:justify-between print:px-3 print:py-3 sm:flex-row sm:items-start sm:justify-between">
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
                    <p className="text-xs sm:text-sm">
                      {companyPhone}
                      {companyPhone && companyEmail ? " / " : ""}
                      {companyEmail}
                    </p>
                  )}

                  {companyAddress && (
                    <p className="text-xs sm:text-sm">
                      {companyAddress}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right print:text-right">
                <div className="space-y-1 text-[11px] sm:text-sm">
                  
                  {/* DATE */}
                  <div className="flex items-center justify-start gap-1.5 sm:justify-end">
                    <span className="min-w-[52px] text-right text-gray-400 uppercase tracking-normal">
                      Date
                    </span>

                    <span className="font-medium">
                      {formatDisplayDate(quoteDate)}
                    </span>
                  </div>

                  {/* QUOTE NUMBER */}
                  <div className="flex items-center justify-start gap-1.5 sm:justify-end">
                    <span className="min-w-[52px] text-right text-gray-400 uppercase tracking-normal">
                      Quote #
                    </span>

                    <span className="font-medium">
                      {quoteNumber}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Bottom row: customer info */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3 text-xs sm:pt-4 sm:text-sm">
              {/* CLIENT INFO */}
              <div className="space-y-1 break-words">
                <p className="text-gray-500 font-semibold uppercase text-[10px] sm:text-xs">
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
                <p className="text-gray-500 font-semibold uppercase text-[10px] sm:text-xs">
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
          <div className="mt-6 rounded-lg border border-[#d9dfd1] bg-[#f8faf5] px-4 py-3 print:mt-4 print:rounded-none print:border-0 print:bg-white print:px-0 print:py-0">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Scope of Work
            </p>
            <p className="text-sm leading-6 text-gray-800 print:text-xs print:leading-snug print:text-black">
              {result.scopeOfWork}
            </p>
          </div>

          {/* =================================================
             LINE ITEMS TABLE
          ================================================= */}
          <table className="mt-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-y border-[#d9dfd1] bg-[#f8faf5] text-xs uppercase text-gray-500">
                <th className="py-2 pl-3 pr-4 text-left print:pl-2">Item</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-center">Qty</th>
                <th className="py-2 pl-4 pr-3 text-right print:pr-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {/* All NON-haul items first */}
              {result.lineItems
                .filter((item) => !item.item.toLowerCase().includes("haul"))
                .map((item, index) => (
                  <tr key={`main-${index}`} className="border-b border-gray-200">
                    <td className="py-2 pl-3 pr-4 font-medium print:pl-2">{item.item}</td>
                    <td className="px-4 py-2 text-gray-700">{item.description}</td>
                    <td className="px-3 py-2 text-center">{item.quantity ?? "-"}</td>
                    <td className="py-2 pl-4 pr-3 text-right font-medium print:pr-2">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}

              {/* Haul-Off LAST */}
              {result.lineItems
                .filter((item) => item.item.toLowerCase().includes("haul"))
                .map((item, index) => (
                  <tr key={`haul-${index}`} className="border-b border-gray-200">
                    <td className="py-2 pl-3 pr-4 font-medium print:pl-2">{item.item}</td>
                    <td className="px-4 py-2 text-gray-700">{item.description}</td>
                    <td className="px-3 py-2 text-center">{item.quantity ?? "-"}</td>
                    <td className="py-2 pl-4 pr-3 text-right font-medium print:pr-2">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* =================================================
            TOTALS SUMMARY
          ================================================== */}
          <div className="ml-auto mt-6 w-full max-w-[320px] space-y-2 rounded-lg border border-[#d9dfd1] bg-[#f8faf5] px-5 py-4 text-sm shadow-sm print:mt-4 print:max-w-[280px] print:rounded-none print:border-0 print:bg-white print:px-3 print:py-2 print:text-[11px]">
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
              <span>
                Emergency{" "}
                <span className="text-[10px] text-gray-500">(25%)</span>
              </span>

              <span>{formatCurrency(result.emergencyFee)}</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-2 font-medium text-gray-900">
              <span>Adjusted Subtotal</span>
              <span>{formatCurrency(result.adjustedSubtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>
                Tax{" "}
                <span className="text-[10px] text-gray-500">(8.25%)</span>
              </span>

              <span>{formatCurrency(result.tax)}</span>
            </div>

            <div className="mt-3 flex justify-between rounded-md bg-[#101522] px-4 py-2.5 text-lg font-bold text-white print:rounded-none print:bg-gray-100 print:px-3 print:py-2 print:text-black">
              <span>Total</span>
              <span>{formatCurrency(result.total)}</span>
            </div>
          </div>

          {/* =================================================
            NOTES / TERMS
          ================================================== */}
          {notes && (
            <div className="mt-4 print:mt-3 border-t border-black pt-3 print:pt-2 break-inside-avoid">
              {/* Section title */}
              <p className="mb-2 print:mb-1 text-sm print:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Notes / Terms
              </p>

              {/* Notes content */}
              <p className="whitespace-pre-line text-xs print:text-[11px] print:leading-snug text-black">
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
      ) : (
        

        /* =================================================
           EMPTY STATE
        ================================================= */
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-lg font-semibold text-gray-500">
              $
            </div>
            <p className="text-sm font-semibold text-gray-700">
              Quote preview will appear here
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Select a base service and enter the required quantity to generate a customer-ready preview.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
