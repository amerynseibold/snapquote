import { useState } from "react"
import type { SavedQuote, QuoteStatus } from "../types"

type QuoteHistoryProps = {
  savedQuotes: SavedQuote[]
  selectedQuoteId: number | null
  confirmDeleteId: number | null
  onLoadQuote: (quote: SavedQuote) => void
  onSetConfirmDeleteId: (id: number | null) => void
  onDeleteQuote: (id: number) => void
  formatCurrency: (value: number) => string
}

/* =========================================================
   QUOTE SUMMARY
   Builds the small service summary shown on history cards
========================================================= */
const getQuoteSummary = (quote: SavedQuote) => {
  const totalTrees =
    Number(quote.tree_count_0_15 || 0) +
    Number(quote.tree_count_15_30 || 0) +
    Number(quote.tree_count_30_60 || 0) +
    Number(quote.tree_count_60_plus || 0)

  if (quote.base_service === "Stump Grinding") {
    return `Stump Grinding • ${quote.stump_count || 0} Stumps`
  }

  return `${quote.base_service || "Service"} • ${totalTrees} Trees`
}

/* =========================================================
   STATUS COLOR STYLES
========================================================= */
const getStatusClasses = (status?: string | null) => {
  switch (status) {
    case "Sent":
      return "bg-blue-50 text-blue-700 border-blue-300"
    case "Approved":
      return "bg-green-50 text-green-700 border-green-300"
    case "Paid":
      return "bg-slate-200 text-slate-800 border-slate-300"
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-300"
  }
}

export function QuoteHistory({
  savedQuotes,
  selectedQuoteId,
  confirmDeleteId,
  onLoadQuote,
  onSetConfirmDeleteId,
  onDeleteQuote,
  formatCurrency,
}: QuoteHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "All">("All")

  const filteredQuotes =
    statusFilter === "All"
      ? savedQuotes
      : savedQuotes.filter((quote) => (quote.status || "Draft") === statusFilter)

  return (
    <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      <div className="border-b border-gray-200 pb-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Quote History</h2>

            <p className="text-xs text-gray-400 mt-1">
              Open, edit, or delete recent saved quotes.
            </p>
          </div>
        </div>

        {/* =========================================================
            STATUS FILTERS
        ========================================================= */}
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", "Draft", "Sent", "Approved", "Paid"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(status as QuoteStatus | "All")
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-3">
        {savedQuotes.length === 0 ? (
          <p className="text-sm text-gray-400">No saved quotes yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => onLoadQuote(quote)}
                className={`border rounded-xl px-5 py-3 text-sm cursor-pointer transition-colors shadow-sm active:bg-gray-50 ${
                  selectedQuoteId === quote.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {quote.quote_number}
                      </h3>

                      <span className="text-xs text-gray-400">
                        {quote.quote_date || "No date"}
                      </span>
                    </div>

                    <span
                      className={`mt-2 inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusClasses(
                        quote.status
                      )}`}
                    >
                      {quote.status || "Draft"}
                    </span>

                    <p className="mt-1 text-sm text-gray-700">
                      {quote.customer_name || "No customer name"}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="text-gray-500">
                        {getQuoteSummary(quote)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(quote.total)}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSetConfirmDeleteId(quote.id)
                      }}
                      className="text-xs font-medium text-red-400 active:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {confirmDeleteId === quote.id && (
                  <div className="mt-3 flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded px-2 py-2">
                    <span className="text-gray-600">Are you sure?</span>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteQuote(quote.id)
                          onSetConfirmDeleteId(null)
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Yes
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetConfirmDeleteId(null)
                        }}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}