import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import type { TreeHeightTier } from "../types"
import type { Customer } from "../types"

/* =========================================================
   PROPS
   Everything QuoteForm needs from page.tsx
========================================================= */

type QuoteFormProps = {
  companyName: string
  quoteNumber: string
  quoteDate: string

  customerName: string
  customerPhone: string
  customerEmail: string
  address: string

  baseService: string
  treeCountsByHeight: Record<TreeHeightTier, number | "">
  difficultTreeCount: number | ""
  hazardTreeCount: number | ""
  stumpCount: number | ""

  haulOffIncluded: boolean
  includeTax: boolean
  emergencyJob: boolean
  discountAmount: string
  logoUrl: string | null

  manualItems: {
    description: string
    qty: string
    price: string
  }[]

  totalTreeCount: number
  selectedQuoteId: number | null
  result: unknown

  inputClass: string

  setCompanyName: (value: string) => void
  setQuoteNumber: (value: string) => void
  setQuoteDate: (value: string) => void

  setCustomerName: (value: string) => void
  setCustomerPhone: (value: string) => void
  setCustomerEmail: (value: string) => void
  setAddress: (value: string) => void

  setBaseService: (value: string) => void
  updateTreeCountByHeight: (tier: TreeHeightTier, value: string) => void
  setDifficultTreeCount: (value: number | "") => void
  setHazardTreeCount: (value: number | "") => void
  setStumpCount: (value: number | "") => void

  setHaulOffIncluded: (value: boolean) => void
  setIncludeTax: (value: boolean) => void
  setEmergencyJob: (value: boolean) => void
  setDiscountAmount: (value: string) => void

  setManualItems: (
    value: {
      description: string
      qty: string
      price: string
    }[]
  ) => void

  findCustomerByPhone: (phoneValue: string) => void

  handleLogoUpload: (e: ChangeEvent<HTMLInputElement>) => void
  handleNewQuote: () => void
  handleDuplicateQuote: () => void
  handleSaveQuote: () => void
  formatPhoneNumber: (value: string) => string
  formatCurrency: (value: number) => string

  /* =========================================================
   CUSTOMER AUTOFILL PROPS
  ========================================================= */
  customerSearchResults: Customer[]
  isSearchingCustomers: boolean
  fetchCustomerSuggestions: (value: string) => void
  setCustomerSearchResults: (value: Customer[]) => void

  /* =========================================================
   RECENT CUSTOMERS
  ========================================================= */
  recentCustomers: Customer[]

}

/* =========================================================
   COMPONENT
========================================================= */

export function QuoteForm({
  companyName,
  quoteNumber,
  quoteDate,

  customerName,
  customerPhone,
  customerEmail,
  address,

  baseService,
  treeCountsByHeight,
  difficultTreeCount,
  hazardTreeCount,
  stumpCount,

  haulOffIncluded,
  includeTax,
  emergencyJob,
  discountAmount,
  logoUrl,

  manualItems,

  totalTreeCount,
  selectedQuoteId,
  result,

  inputClass,

  setCompanyName,
  setQuoteNumber,
  setQuoteDate,

  setCustomerName,
  setCustomerPhone,
  setCustomerEmail,
  setAddress,

  setBaseService,
  updateTreeCountByHeight,
  setDifficultTreeCount,
  setHazardTreeCount,
  setStumpCount,

  setHaulOffIncluded,
  setIncludeTax,
  setEmergencyJob,
  setDiscountAmount,
  setManualItems,

  handleLogoUpload,
  handleNewQuote,
  handleDuplicateQuote,
  handleSaveQuote,
  formatPhoneNumber,
  formatCurrency,

  customerSearchResults,
  isSearchingCustomers,
  recentCustomers,
  fetchCustomerSuggestions,
  setCustomerSearchResults,
  findCustomerByPhone,
}: QuoteFormProps) {
  const customerDropdownRef = useRef<HTMLDivElement | null>(null)
  const [isCustomerInputFocused, setIsCustomerInputFocused] = useState(false)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setCustomerSearchResults([])
        setIsCustomerInputFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  return (
    /* =====================================================
       QUOTE BUILDER FORM
    ===================================================== */
    <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 sm:p-4 space-y-4">
      
      {/* =================================================
         FORM HEADER + DESKTOP ACTION BUTTONS
      ================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-semibold">Quote Builder</h2>
          <p className="text-xs text-gray-400 mt-1">
            Enter the job details, then review the quote preview below.
          </p>
        </div>

        <div className="hidden sm:flex gap-2">
          <button
            onClick={handleNewQuote}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm shadow-sm"
          >
            New Quote
          </button>

          <button
            onClick={handleDuplicateQuote}
            disabled={!selectedQuoteId}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded text-sm shadow-sm"
          >
            Duplicate Quote
          </button>

          <button
            onClick={handleSaveQuote}
            disabled={!result}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-4 py-2 rounded text-sm shadow-sm"
          >
            Save Quote
          </button>

          <button
            onClick={() => window.print()}
            disabled={!result}
            className="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-4 py-2 rounded text-sm shadow-sm"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* =================================================
         FORM GRID
      ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">

        {/* LEFT COLUMN: Quote Info + Branding */}
        <div className="xl:col-span-3 space-y-3">

          {/* Quote Info */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quote Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block mb-1 text-sm">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Quote Number</label>
                <input
                  type="text"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Quote Date</label>
                <input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className={`${inputClass} min-w-0 appearance-none`}
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Branding
            </h3>

            <div>
              <label className="block mb-1 text-sm">Customer-Facing Logo</label>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-800 shadow-sm">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoUrl ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-9 w-9 rounded object-contain border border-gray-300 bg-white"
                    />
                    <span className="text-sm text-gray-600">Logo uploaded</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No file chosen</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Customer Info */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3 xl:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div>
              <label className="block mb-1 text-sm">Customer Name</label>
                {/* Customer name input + autofill dropdown */}
                <div className="relative" ref={customerDropdownRef}>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={customerName}
                    onChange={(e) => {
                      const value = e.target.value

                      setCustomerName(value)

                      if (value.trim().length < 2) {
                        setCustomerSearchResults([])
                        return
                      }

                      fetchCustomerSuggestions(value)
                    }}
                    onFocus={() => {
                      setIsCustomerInputFocused(true)

                      if (customerName.length >= 2) {
                        fetchCustomerSuggestions(customerName)
                      }
                    }}
                    className={inputClass}
                  />

                  {/* Loading indicator while searching customers */}
                  {isSearchingCustomers && (
                    <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 shadow">
                      Searching customers...
                    </div>
                  )}

                  {/* Matching saved customers */}
                  {/* =========================================================
                    CUSTOMER DROPDOWN (Search Results OR Recent Customers)
                  ========================================================= */}
                  {/* Customer search results */}
                  {isCustomerInputFocused &&
                    !isSearchingCustomers &&
                    customerName.trim().length >= 2 &&
                    customerSearchResults.length > 0 && (
                      <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow">
                        {customerSearchResults.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              setCustomerName(customer.customer_name)
                              setCustomerPhone(
                                customer.customer_phone
                                  ? formatPhoneNumber(customer.customer_phone)
                                  : ""
                              )
                              setCustomerEmail(customer.customer_email || "")
                              setAddress(customer.address || "")
                              setCustomerSearchResults([])
                              setIsCustomerInputFocused(false)
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <div className="font-medium text-gray-900">
                              {customer.customer_name}
                            </div>

                            <div className="text-xs text-gray-500">
                              {customer.customer_phone
                                ? formatPhoneNumber(customer.customer_phone)
                                : "No phone"}
                              {customer.customer_email ? ` · ${customer.customer_email}` : ""}
                              {customer.address ? ` · ${customer.address}` : ""}
                            </div>
                          </button>
                        ))}
                      </div>
                  )}
                </div>            
              </div>

            <div>
              <label className="block mb-1 text-sm">Service Address</label>
              <input
                type="text"
                placeholder="Enter service address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Customer Phone</label>
              <input
                type="tel"
                placeholder="(555) 555-5555"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(formatPhoneNumber(e.target.value))
                }
                onBlur={() => findCustomerByPhone(customerPhone)}
                maxLength={14}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Customer Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Job Details + Additional Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm xl:col-span-6 xl:min-h-[160px]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Job Details
          </h3>

          {/* Base job inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm">Base Service</label>
              <select
                value={baseService}
                onChange={(e) => setBaseService(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select service...
                </option>
                <option>Tree Trimming</option>
                <option>Tree Removal</option>
                <option>Stump Grinding</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Haul-Off</label>
              <select
                value={haulOffIncluded ? "yes" : "no"}
                onChange={(e) =>
                  setHaulOffIncluded(e.target.value === "yes")
                }
                className={inputClass}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm"># of Stumps</label>
              <input
                type="number"
                min="0"
                placeholder="#"
                value={stumpCount}
                onChange={(e) => {
                  const val = e.target.value
                  setStumpCount(val === "" ? "" : Number(val))
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
          </div>

          {/* Tree-specific inputs hide when Stump Grinding is selected */}
          {baseService !== "Stump Grinding" && (
            <>
              <div>
                <label className="block font-semibold mb-3">
                  Trees by Height
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(
                    ["0-15 ft", "15-30 ft", "30-60 ft", "60+ ft"] as TreeHeightTier[]
                  ).map((tier) => (
                    <div key={tier}>
                      <label className="block mb-1 text-sm">{tier}</label>
                      <input
                        type="number"
                        placeholder="#"
                        min="0"
                        value={treeCountsByHeight[tier]}
                        onChange={(e) =>
                          updateTreeCountByHeight(tier, e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm">Difficult Trees</label>
                  <input
                    type="number"
                    placeholder="#"
                    min="0"
                    value={difficultTreeCount}
                    onChange={(e) => {
                      const val = e.target.value
                      const num = Number(val)
                      const maxTrees = totalTreeCount

                      setDifficultTreeCount(
                        val === "" ? "" : Math.min(num, maxTrees)
                      )
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Hazard Trees</label>
                  <input
                    type="number"
                    placeholder="#"
                    min="0"
                    value={hazardTreeCount}
                    onChange={(e) => {
                      const val = e.target.value
                      const num = Number(val)
                      const maxTrees = totalTreeCount

                      setHazardTreeCount(
                        val === "" ? "" : Math.min(num, maxTrees)
                      )
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* Additional manual line items */}
          <div className="mt-3 space-y-2">
            <h4 className="text-xs font-semibold uppercase text-gray-500">
              Additional Items
            </h4>

            <div className="grid grid-cols-[2fr_0.7fr_1fr_1fr_0.5fr] gap-2 text-xs text-gray-400 uppercase border-b border-gray-200 pb-1">
              <span>Description</span>
              <span>Qty</span>
              <span>Price</span>
              <span className="text-right">Total</span>
              <span></span>
            </div>

            {manualItems.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-[2fr_0.7fr_1fr_1fr_auto] gap-2 items-center pb-2 transition-colors duration-150 ${
                  index !== manualItems.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } hover:bg-gray-50`}
              >
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...manualItems]
                    updated[index].description = e.target.value
                    setManualItems(updated)
                  }}
                  className={`${inputClass} text-sm sm:text-base py-1.5 sm:py-2`}
                />

                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => {
                    const updated = [...manualItems]
                    updated[index].qty = e.target.value
                    setManualItems(updated)
                  }}
                  className={`${inputClass} text-sm sm:text-base py-1.5 sm:py-2`}
                />

                <input
                  type="text"
                  placeholder="$0"
                  value={item.price ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "")

                    const updated = [...manualItems]
                    updated[index].price = raw
                    setManualItems(updated)
                  }}
                  onBlur={() => {
                    if (item.price !== "") {
                      const updated = [...manualItems]
                      updated[index].price = String(Number(item.price))
                      setManualItems(updated)
                    }
                  }}
                  className={inputClass}
                />

                {/* Live total for this manual item row */}
                <div className="text-sm font-medium text-right text-gray-700">
                  {formatCurrency(
                    (Number(item.qty) || 0) * (Number(item.price) || 0)
                  )}
                </div>

                <button
                  onClick={() =>
                    setManualItems(manualItems.filter((_, i) => i !== index))
                  }
                  className="text-red-400 text-xs hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={() =>
                setManualItems([
                  ...manualItems,
                  { description: "", qty: "", price: "" },
                ])
              }
              className="text-blue-600 text-sm"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          PRICING ADJUSTMENTS
        ================================================= */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pricing Adjustments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tax toggle */}
            <div>
              <label className="block mb-1 text-sm">Tax</label>
              <select
                value={includeTax ? "yes" : "no"}
                onChange={(e) => setIncludeTax(e.target.value === "yes")}
                className={inputClass}
              >
                <option value="yes">Include</option>
                <option value="no">Exclude</option>
              </select>
            </div>

            {/* Emergency toggle */}
            <div>
              <label className="block mb-1 text-sm">Emergency</label>
              <select
                value={emergencyJob ? "yes" : "no"}
                onChange={(e) => setEmergencyJob(e.target.value === "yes")}
                className={inputClass}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Discount input */}
            <div>
              <label className="block mb-1 text-sm">Discount</label>
              <input
                type="text"
                placeholder="$0"
                value={discountAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "")
                  const parts = raw.split(".")
                  const cleaned =
                    parts.length > 2 ? parts[0] + "." + parts[1] : raw
                  const limited = cleaned.includes(".")
                    ? cleaned.split(".")[0] +
                      "." +
                      cleaned.split(".")[1].slice(0, 2)
                    : cleaned

                  setDiscountAmount(limited)
                }}
                onBlur={() => {
                  if (discountAmount !== "") {
                    setDiscountAmount(Number(discountAmount).toFixed(2))
                  }
                }}
                className={inputClass}
              />
            </div>
          </div>
        </div>

      {/* Validation warning */}
      {((difficultTreeCount || 0) > totalTreeCount ||
        (hazardTreeCount || 0) > totalTreeCount) && (
        <div className="text-red-500 text-sm">
          Counts cannot exceed total trees.
        </div>
      )}
    </section>
  )
}