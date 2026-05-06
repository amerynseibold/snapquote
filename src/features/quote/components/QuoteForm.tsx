import { useEffect, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import type { TreeHeightTier } from "../types"
import type { Customer } from "../types"

/* =========================================================
   PROPS
   Everything QuoteForm needs from page.tsx
========================================================= */

type QuoteFormProps = {
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


  manualItems: {
    description: string
    qty: string
    price: string
  }[]

  totalTreeCount: number
  selectedQuoteId: number | null
  result: unknown

  inputClass: string

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

  manualItems,

  totalTreeCount,
  selectedQuoteId,
  result,

  inputClass,

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

  useEffect(() => {
    if ((difficultTreeCount || 0) > totalTreeCount) {
      setDifficultTreeCount(totalTreeCount)
    }

    if ((hazardTreeCount || 0) > totalTreeCount) {
      setHazardTreeCount(totalTreeCount)
    }
  }, [
    totalTreeCount,
    difficultTreeCount,
    hazardTreeCount,
    setDifficultTreeCount,
    setHazardTreeCount,
  ])

  return (
    /* =====================================================
       QUOTE BUILDER FORM
    ===================================================== */
    <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 sm:p-4 space-y-4 w-full">
      

      {/* =================================================
         FORM HEADER + DESKTOP ACTION BUTTONS
      ================================================= */}
      <div className="flex items-end justify-between border-b border-gray-200 pb-3 min-h-[64px]">
        <div>
          <h2 className="text-lg font-semibold">Quote Builder</h2>
          <p className="text-xs text-gray-400 mt-1">
            Enter the job details, then review quote preview below.
          </p>
        </div>
      </div>

      {/* =================================================
         FORM GRID
      ================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4 xl:gap-3 items-start">

        {/* LEFT COLUMN: Quote Info + Cusomter Info*/}
        <div className="space-y-3 ">

          {/* Quote Info */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quote Info
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm text-gray-600">Quote Number</label>
                <input
                  type="text"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">Quote Date</label>
                <input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className={`${inputClass} min-w-0 appearance-none`}
                />
              </div>
            </div>
          </div>

           {/* Customer Info */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3 w-full xl:max-w-[320px]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Customer Info
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Customer Name</label>
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
              <label className="block mb-1 text-sm text-gray-600">Customer Phone</label>
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
            
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-600">Service Address</label>
              <input
                type="text"
                placeholder="Enter service address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-600">Customer Email</label>
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
      </div>


        {/* RIGHT COLUMN: Job Details */}
        <div className="space-y-3">

        {/* Job Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm w-full xl:max-w-[425px]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Job Details
          </h3>

        {/* Base job input */}
        <div className="w-full xl:w-[350px]">
          <label className="block mb-1 text-sm text-gray-600">Base Service</label>
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

        {/* Tree-specific inputs hide when Stump Grinding is selected */}
        {baseService !== "Stump Grinding" && (
          <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] justify-start gap-y-2 gap-x-12">
            <div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Trees by Height
                </label>

                <span className="hidden md:block text-xs text-gray-500">
                  {totalTreeCount} total
                </span>
              </div>
              <div className="mt-1 mb-2 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 md:hidden">
                Trees: {totalTreeCount} total
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-[200px]">
                {(
                  ["0-15 ft", "15-30 ft", "30-60 ft", "60+ ft"] as TreeHeightTier[]
                ).map((tier) => (
                  <div key={tier}>
                    <label className="block mb-1 text-sm text-gray-600">{tier}</label>
                    <input
                      type="number"
                      placeholder="#"
                      min="0"
                      value={treeCountsByHeight[tier]}
                      onChange={(e) => updateTreeCountByHeight(tier, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className={inputClass}
                    />

                    <div className="mt-1 flex gap-1 md:hidden">
                      {[-1, 1, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            const current = Number(treeCountsByHeight[tier]) || 0
                            const next = Math.max(0, current + val)
                            updateTreeCountByHeight(tier, String(next))
                          }}
                          className={`flex-1 rounded-md border py-2 text-sm font-semibold shadow-sm active:scale-95 ${
                            val < 0
                              ? "border-red-200 bg-red-50 text-red-600 active:bg-red-100"
                              : "border-gray-300 bg-gray-100 text-gray-800 active:bg-gray-200"
                          }`}
                        >
                          {val > 0 ? `+${val}` : val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:pt-[23px] w-full sm:w-[100px]">
              <div>
                <label className="block mb-1 text-sm text-gray-600">Difficult Trees</label>
                <input
                  type="number"
                  placeholder="#"
                  min="0"
                  value={difficultTreeCount}
                  onChange={(e) => {
                    e.preventDefault()
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
                <div className="mt-1 flex gap-1 md:hidden">
                  {[-1, 1, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const current = Number(difficultTreeCount) || 0
                        const next = Math.max(0, Math.min(totalTreeCount, current + val))
                        setDifficultTreeCount(next)
                      }}
                      className={`flex-1 rounded-md border py-2 text-sm font-semibold shadow-sm active:scale-95 ${
                        val < 0
                          ? "border-red-200 bg-red-50 text-red-600 active:bg-red-100"
                          : "border-gray-300 bg-gray-100 text-gray-800 active:bg-gray-200"
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-600">Hazard Trees</label>
                <input
                  type="number"
                  placeholder="#"
                  min="0"
                  value={hazardTreeCount}
                  onChange={(e) => {
                    e.preventDefault()
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
                <div className="mt-1 flex gap-1 md:hidden">
                  {[-1, 1, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        const current = Number(hazardTreeCount) || 0
                        const next = Math.max(0, Math.min(totalTreeCount, current + val))
                        setHazardTreeCount(next)
                      }}
                      className={`flex-1 rounded-md border py-2 text-sm font-semibold shadow-sm active:scale-95 ${
                        val < 0
                          ? "border-red-200 bg-red-50 text-red-600 active:bg-red-100"
                          : "border-gray-300 bg-gray-100 text-gray-800 active:bg-gray-200"
                      }`}
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stumps + Haul-Off row */}
        <div className="grid grid-cols-2 gap-2 w-full xl:w-[350px]">
          <div>
            <label className="block mb-1 text-sm text-gray-600"># of Stumps</label>
            <input
              type="number"
              min="0"
              placeholder="#"
              value={stumpCount}
              onChange={(e) => {
                e.preventDefault()
                const val = e.target.value
                setStumpCount(val === "" ? "" : Number(val))
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className={inputClass}
            />
            <div className="mt-1 flex gap-1 md:hidden">
              {[-1, 1, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const current = Number(stumpCount) || 0
                    const next = Math.max(0, current + val)
                    setStumpCount(next)
                  }}
                  className={`flex-1 rounded-md border py-2 text-sm font-semibold shadow-sm active:scale-95 ${
                    val < 0
                      ? "border-red-200 bg-red-50 text-red-600 active:bg-red-100"
                      : "border-gray-300 bg-gray-100 text-gray-800 active:bg-gray-200"
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-600">Haul-Off</label>
            <select
              value={haulOffIncluded ? "yes" : "no"}
              onChange={(e) => setHaulOffIncluded(e.target.value === "yes")}
              className={inputClass}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

          {/* Additional manual line items */}
          <div className="mt-3 space-y-2"> 
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Additional Services
            </h4> 
          </div>        

          {/* Landscape / desktop header */}
          <div className="hidden sm:grid grid-cols-[3.25fr_1fr_1.5fr_1.2fr_1fr] gap-2 text-xs text-gray-400 uppercase pb-1">
  
            {/* Columns WITH border */}
            <div className="col-span-4 grid grid-cols-[3.25fr_1fr_1.5fr_1.2fr] gap-2 border-b border-gray-200 pb-1">
              <span>Description</span>
              <span>Qty</span>
              <span>Price</span>
              <span className="text-right">Total</span>
            </div>

            {/* Remove column (no border) */}
            <div></div>

          </div>

          {manualItems.map((item, index) => (
            <div
              key={index}
              className={`pb-3 transition-colors duration-150 ${
                index !== manualItems.length - 1 ? "border-b border-gray-200" : ""
              } hover:bg-gray-50`}
            >
            {/* Mobile portrait layout */}
            <div className="grid grid-cols-4 gap-2 sm:hidden">
              {/* Service (3/4 width) */}
              <input
                type="text"
                placeholder="Service"
                value={item.description}
                onChange={(e) => {
                  const updated = [...manualItems]
                  updated[index].description = e.target.value
                  setManualItems(updated)
                }}
                className={`${inputClass} col-span-3 min-w-0 text-sm`}
              />

              {/* Remove */}
              <button
                onClick={() =>
                  setManualItems(manualItems.filter((_, i) => i !== index))
                }
                className="text-red-400 text-xs hover:text-red-600 text-right flex items-center justify-end"
              >
                Remove
              </button>

              {/* Qty */}
              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => {
                  const updated = [...manualItems]
                  updated[index].qty = e.target.value
                  setManualItems(updated)
                }}
                className={`${inputClass} min-w-0 text-sm`}
              />

              {/* Price */}
              <input
                type="text"
                placeholder="Price $"
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
                className={`${inputClass} min-w-0 text-sm`}
              />

              {/* Total */}
              <div className="col-span-2 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                <span className="text-gray-400 uppercase text-[10px] tracking-wide text-right">
                  Total
                </span>
                <span>
                  {formatCurrency(
                    (Number(item.qty) || 0) * (Number(item.price) || 0)
                  )}
                </span>
              </div>
            </div>

              {/* Landscape / desktop row */}        
              <div className="hidden sm:grid grid-cols-[3.25fr_1fr_1.5fr_1.2fr_1fr] gap-2 items-center">
                <input
                  type="text"
                  placeholder="Service"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...manualItems]
                    updated[index].description = e.target.value
                    setManualItems(updated)
                  }}
                  className={`${inputClass} min-w-0 text-sm`}
                />

                <input
                  type="number"
                  placeholder="#"
                  value={item.qty}
                  onChange={(e) => {
                    const updated = [...manualItems]
                    updated[index].qty = e.target.value
                    setManualItems(updated)
                  }}
                  className={`${inputClass} min-w-0 text-sm`}
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
                  className={`${inputClass} min-w-0 text-sm`}
                />

                <div className="text-sm font-medium text-right text-gray-700">
                  {formatCurrency((Number(item.qty) || 0) * (Number(item.price) || 0))}
                </div>

                <button
                  onClick={() =>
                    setManualItems(manualItems.filter((_, i) => i !== index))
                  }
                  className="text-[10px] text-red-400 hover:text-red-600 text-right"
                >
                  Remove
                </button>
              </div>
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

      {/* =================================================
          PRICING ADJUSTMENTS
      ================================================= */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3 w-full xl:max-w-[425px]">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Pricing Adjustments
        </h3>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
          {/* Tax toggle */}
          <div>
            <label className="block mb-1 text-sm text-gray-600">Tax</label>
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
            <label className="block mb-1 text-sm text-gray-600">Emergency</label>
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
            <label className="block mb-1 text-sm text-gray-600">Discount</label>
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
                  setDiscountAmount(Number(discountAmount).toFixed(0))
                }
              }}
              className={inputClass}
            />
          </div>
        </div>
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