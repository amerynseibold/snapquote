import type { SavedQuote } from "../types"

type QuoteHistoryProps = {
  savedQuotes: SavedQuote[]
  selectedQuoteId: number | null
  confirmDeleteId: number | null
  onLoadQuote: (quote: SavedQuote) => void
  onSetConfirmDeleteId: (id: number | null) => void
  onDeleteQuote: (id: number) => void
  formatCurrency: (value: number) => string
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
  return (
    <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
      <div className="flex items-end justify-between border-b border-gray-200 pb-3 min-h-[64px]">
        <div>
          <h2 className="text-lg font-semibold">Quote History</h2>
          <p className="text-xs text-gray-400 mt-1">
            Open, edit, or delete recent saved quotes.
          </p>
        </div>
      </div>

      <div className="mt-3 flex-1 min-h-0 overflow-y-auto pr-3">
        {savedQuotes.length === 0 ? (
          <p className="text-sm text-gray-400">No saved quotes yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {savedQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => onLoadQuote(quote)}
                className={`border rounded-lg p-4 text-sm cursor-pointer transition ${
                  selectedQuoteId === quote.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start gap-3 font-semibold">
                  <div>
                    <span>{quote.quote_number}</span>
                    <span className="ml-2 text-gray-700">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSetConfirmDeleteId(quote.id)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                  >
                    Delete
                  </button>
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

                <div className="text-gray-600 mt-2">
                  {quote.customer_name || "No customer name"}
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  {quote.quote_date || "No date"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}