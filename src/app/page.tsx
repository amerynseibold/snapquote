"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { calculateQuote } from "@/lib/calculateQuote"
import { pricingConfig } from "@/lib/pricingConfig"
import { supabase } from "@/lib/supabase"

type SavedQuote = {
  id: number
  quote_number: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  address: string | null
  quote_date: string | null
  base_service: string
  tree_count_0_15: number
  tree_count_15_30: number
  tree_count_30_60: number
  tree_count_60_plus: number
  difficult_tree_count: number
  hazard_tree_count: number
  stump_count: number
  haul_off_included: boolean
  emergency_job: boolean
  discount_amount: number
  total: number
}

type TreeHeightTier = "0-15 ft" | "15-30 ft" | "30-60 ft" | "60+ ft"

export default function Home() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [quoteNumber, setQuoteNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [address, setAddress] = useState("")
  const [quoteDate, setQuoteDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [baseService, setBaseService] = useState("")
  const [treeCountsByHeight, setTreeCountsByHeight] = useState<
    Record<TreeHeightTier, number | "">
    >({
      "0-15 ft": "",
      "15-30 ft": "",
      "30-60 ft": "",
      "60+ ft": "",
      
  })
  const [difficultTreeCount, setDifficultTreeCount] = useState<number | "">("")
  const [hazardTreeCount, setHazardTreeCount] = useState<number | "">("")
  const [stumpCount, setStumpCount] = useState<number | "">("")
  const [haulOffIncluded, setHaulOffIncluded] = useState(true)
  const [emergencyJob, setEmergencyJob] = useState(false)
  const [discountAmount, setDiscountAmount] = useState<number | "">("")
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const formatDisplayDate = (dateString: string) => {
    if(!dateString) return ""

    const [year, month, day] = dateString.split("-")

    return `${month}-${day}-${year}`
  }

  const loadQuote = (quote: SavedQuote) => {
    setSelectedQuoteId(quote.id)
    setQuoteNumber(quote.quote_number)
    setCustomerName(quote.customer_name || "")
    setCustomerPhone(quote.customer_phone || "")
    setCustomerEmail(quote.customer_email || "")
    setAddress(quote.address || "")
    setQuoteDate(quote.quote_date || "")
    

    setBaseService(quote.base_service)
    setTreeCountsByHeight({
      "0-15 ft": quote.tree_count_0_15 || "",
      "15-30 ft": quote.tree_count_15_30 || "",
      "30-60 ft": quote.tree_count_30_60 || "",
      "60+ ft": quote.tree_count_60_plus || "",
    })

    setDifficultTreeCount(quote.difficult_tree_count)
    setHazardTreeCount(quote.hazard_tree_count)
    setStumpCount(quote.stump_count)

    setHaulOffIncluded(quote.haul_off_included)
    setEmergencyJob(quote.emergency_job)

    setDiscountAmount(quote.discount_amount)
  }

  const deleteQuote = async (quoteId: number) => {


    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", quoteId)

    if (error) {
      console.error("Error deleting quote:", error)
      alert(`Failed to delete quote: ${error.message}`)
      return
    }

    if (selectedQuoteId === quoteId) {
      setSelectedQuoteId(null)
    }

    await fetchSavedQuotes()
  }

  const inputClass =
    "w-full h-12 bg-black text-white border border-gray-700 shadow-lg rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"

  const updateTreeCountByHeight = (tier: TreeHeightTier, value: string) => {
    setTreeCountsByHeight((prev) => ({
      ...prev,
      [tier]: value === "" ? "" : Number(value),
    }))
  }  

  const totalTreeCount: number = Object.values(treeCountsByHeight).reduce(
    (sum: number, value) => sum + (Number(value) || 0),
    0
  )

  const formatQuoteNumber = (num: number) => {
    return `P-${String(num).padStart(3, "0")}`
  }

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const fileExt = file.name.split(".").pop()
  const filePath = `company-logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(filePath, file, {
      upsert: true,
    })

  if (uploadError) {
    console.error("Error uploading logo:", uploadError)
    alert("Failed to upload logo.")
    return
  }

  const { data } = supabase.storage.from("logos").getPublicUrl(filePath)

  const publicUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from("app_settings")
    .update({ logo_url: publicUrl })
    .eq("id", 1)

  if (updateError) {
    console.error("Error saving logo URL:", updateError)
    alert("Logo uploaded, but failed to save logo URL.")
    return
  }

  setLogoUrl(publicUrl)
  alert("Logo saved successfully.")
}

  const fetchSavedQuotes = async () => {
  const { data, error } = await supabase
    .from("quotes")
    .select(`
  id,
  quote_number,
  customer_name,
  customer_phone,
  customer_email,
  address,
  quote_date,
  base_service,
  tree_count_0_15,
  tree_count_15_30,
  tree_count_30_60,
  tree_count_60_plus,
  difficult_tree_count,
  hazard_tree_count,
  stump_count,
  haul_off_included,
  emergency_job,
  discount_amount,
  total
`)
    .order("created_at", { ascending: false })
    .limit(10)
  if (error) {
    console.error("Error fetching saved quotes:", error)
    return
  }

  setSavedQuotes((data || []) as SavedQuote[])
  }

  useEffect(() => {
  const fetchSuggestedQuoteNumber = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("next_quote_number, logo_url")
      .eq("id", 1)
      .single()

    if (error) {
      console.error("Error fetching next quote number:", error)
      setQuoteNumber("P-001")
      return
    }

    if (!quoteNumber) {
      setQuoteNumber(formatQuoteNumber(data.next_quote_number))
      if (data.logo_url) {
        setLogoUrl(data.logo_url)
      }
    }
  }

  fetchSuggestedQuoteNumber()
  fetchSavedQuotes()
  }, []) 
  
  useEffect(() => {
    if (baseService === "Stump Grinding") {
      setTreeCountsByHeight({
        "0-15 ft": "",
        "15-30 ft": "",
        "30-60 ft": "",
        "60+ ft": "",
      })
      setDifficultTreeCount("")
      setHazardTreeCount("")
    }
  }, [baseService])

  const hasRequiredInputs =
  baseService === "Stump Grinding"
    ? (stumpCount || 0) > 0
    : baseService !== "" && totalTreeCount > 0

  const result = hasRequiredInputs
    ? calculateQuote(
        {
          baseService,
          treeCountsByHeight: {
            "0-15 ft": Number(treeCountsByHeight["0-15 ft"]) || 0,
            "15-30 ft": Number(treeCountsByHeight["15-30 ft"]) || 0,
            "30-60 ft": Number(treeCountsByHeight["30-60 ft"]) || 0,
            "60+ ft": Number(treeCountsByHeight["60+ ft"]) || 0,
          },
          difficultTreeCount: difficultTreeCount || 0,
          hazardTreeCount: hazardTreeCount || 0,
          stumpCount: stumpCount || 0,
          haulOffIncluded,
          emergencyJob,
          discountAmount: discountAmount || 0,
        },
        pricingConfig
      )
    : null

  const handleSaveQuote = async () => {
  if (!result) return

   if (!customerName || !customerName.trim()) {
    alert("Please enter a customer name before saving.")
    return
  }

   if (!customerPhone || !customerPhone.trim()) {
    alert("Please enter a customer phone number before saving.")
    return
  }

   if (!address || !address.trim()) {
    alert("Please enter a service address before saving.")
    return
  }


  const { error } = await supabase.from("quotes").upsert(
    [
      {
        quote_number: quoteNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        address,
        quote_date: quoteDate,
        base_service: baseService,
        difficult_tree_count: difficultTreeCount || 0,
        hazard_tree_count: hazardTreeCount || 0,
        tree_count: totalTreeCount,
        tree_count_0_15: Number(treeCountsByHeight["0-15 ft"]) || 0,
        tree_count_15_30: Number(treeCountsByHeight["15-30 ft"]) || 0,
        tree_count_30_60: Number(treeCountsByHeight["30-60 ft"]) || 0,
        tree_count_60_plus: Number(treeCountsByHeight["60+ ft"]) || 0,
        stump_count: stumpCount || 0,
        haul_off_included: haulOffIncluded,
        emergency_job: emergencyJob,
        discount_amount: discountAmount || 0,
        subtotal: result.subtotal,
        subtotal_after_discount: result.subtotalAfterDiscount,
        emergency_fee: result.emergencyFee,
        adjusted_subtotal: result.adjustedSubtotal,
        tax: result.tax,
        total: result.total,
      },
    ],
    { onConflict: "quote_number" }
  )

    if (error) {
      console.error("Error saving quote:", error)
      alert(`Failed to save quote: ${error.message}`)
      return
    }

    const { data: settingsData, error: settingsError } = await supabase
    .from("app_settings")
    .select("next_quote_number")
    .eq("id", 1)
    .single()

    if (!settingsError) {
    const suggestedQuoteNumber = formatQuoteNumber(
      settingsData.next_quote_number
    )

    if (quoteNumber === suggestedQuoteNumber) {
      const nextNumber = settingsData.next_quote_number + 1

      const { error: updateError } = await supabase
        .from("app_settings")
        .update({ next_quote_number: nextNumber })
        .eq("id", 1)

      if (updateError) {
        console.error("Error updating next quote number:", updateError)
      }
    }
  }
  await fetchSavedQuotes()
  alert("Quote saved successfully.")
  }

  const handleNewQuote = async () => {
  // clear all inputs
  setSelectedQuoteId(null)
  setConfirmDeleteId(null)
  setCustomerName("")
  setCustomerPhone("")
  setCustomerEmail("")
  setAddress("")
  setBaseService("")
  setTreeCountsByHeight({
  "0-15 ft": "",
  "15-30 ft": "",
  "30-60 ft": "",
  "60+ ft": "", })
  setDifficultTreeCount("")
  setHazardTreeCount("")
  setStumpCount("")
  setHaulOffIncluded(true)
  setEmergencyJob(false)
  setDiscountAmount("")

  // reset date to today
  setQuoteDate(new Date().toISOString().split("T")[0])

  // fetch next suggested quote number
  const { data, error } = await supabase
    .from("app_settings")
    .select("next_quote_number")
    .eq("id", 1)
    .single()

  if (error) {
    console.error("Error fetching next quote number:", error)
    setQuoteNumber("P-001")
    return
  }

  setQuoteNumber(formatQuoteNumber(data.next_quote_number))
  }  

  // format phone number
  const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10)

  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 10)

    if (digits.length < 4) return part1
    if (digits.length < 7) return `(${part1}) ${part2}`
    return `(${part1}) ${part2}-${part3}`
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  return (
    <main className="relative p-4 md:p-6 xl:p-10 print:p-0 space-y-6 xl:space-y-8">
      <div className="flex items-center gap-3 print:hidden mb-6">
  <img
    src="/logo.png"
    alt="SnapQuote Logo"
    className="h-18 w-auto"
  />
</div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6 xl:gap-8">
        <div className="space-y-4 print:hidden">
          <div className="pb-3 mb-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Inputs</h2>
          </div>
          
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 xl:grid-cols-3 gap-3">
            <div>
              <label className="block mb-2">Quote Number</label>
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-2">Quote Date</label>
              <input
                type="date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                className={`${inputClass} min-w-0 w-full appearance-none`}
              />
            </div>

            <div>
              <label className="block mb-2">Customer Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block mb-2">Service Address</label>
            <input
              type="text"
              placeholder="Enter Service Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 min-[500px]::grid-cols-2 gap-3">
            <div>
              <label className="block mb-2">Customer Phone</label>
              <input
                type="tel"
                placeholder="(555) 555-5555"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                maxLength={14}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-2">Customer Email</label>
              <input
                type="email"
                placeholder="Enter Customer Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Base Service</label>
            <select
              value={baseService}
              onChange={(e) => setBaseService(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select Service...
              </option>
              <option>Tree Trimming</option>
              <option>Tree Removal</option>
              <option>Stump Grinding</option>
            </select>
          </div>

        {baseService !== "Stump Grinding" && (
          <div>
            <label className="block font-semibold mb-3">Trees by Height</label>

            <div className="grid grid-cols-1 min-[500px]::grid-cols-2 gap-3">
              {(["0-15 ft", "15-30 ft", "30-60 ft", "60+ ft"] as TreeHeightTier[]).map(
                (tier) => (
                  <div key={tier}>
                    <label className="block mb-2 text-sm">{tier}</label>
                    <input
                      type="number"
                      placeholder="#"
                      min="0"
                      value={treeCountsByHeight[tier]}
                      onChange={(e) => updateTreeCountByHeight(tier, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className={inputClass}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}
 

        {baseService !== "Stump Grinding" && (
          <div className="grid grid-cols-1 min-[500px]::grid-cols-2 gap-3">
            <div>
              <label className="block mb-2">Difficult Trees</label>
              <input
                type="number"
                placeholder="#"
                min="0"
                value={difficultTreeCount}
                onChange={(e) => {
                  const val = e.target.value
                  const num = Number(val)
                  const maxTrees = totalTreeCount
                  setDifficultTreeCount(Math.min(num, maxTrees))
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block mb-2">Hazard Trees</label>
              <input
                type="number"
                placeholder="#"
                min="0"
                value={hazardTreeCount}
                onChange={(e) => {
                  const val = e.target.value
                  const num = Number(val)
                  const maxTrees = totalTreeCount
                  setHazardTreeCount(Math.min(num, maxTrees))
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
          </div>
        )} 

          <div className="grid grid-cols-1 min-[500px]::grid-cols-2 gap-3">
            <div>
              <label className="block mb-2">Haul-Off</label>
              <select
                value={haulOffIncluded ? "yes" : "no"}
                onChange={(e) => setHaulOffIncluded(e.target.value === "yes")}
                className={inputClass}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Emergency</label>
              <select
                value={emergencyJob ? "yes" : "no"}
                onChange={(e) => setEmergencyJob(e.target.value === "yes")}
                className={inputClass}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[500px]::grid-cols-2 gap-3">
            <div>
              <label className="block mb-2"># of Stumps</label>
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

            <div>
              <label className="block mb-2">Discount</label>
              <input
                type="number"
                placeholder="$"
                value={discountAmount}
                onChange={(e) => {
                  const val = e.target.value
                  setDiscountAmount(val === "" ? "" : Number(val))
                }}
                onWheel={(e) => e.currentTarget.blur()}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs uppercase text-gray-400 mb-3">Branding</p>

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-sm"
              />

              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-10 w-auto object-contain"
                />
              )}
            </div>
          </div>

          {((difficultTreeCount || 0) > totalTreeCount ||
            (hazardTreeCount || 0) > totalTreeCount) && (
            <div className="text-red-500 text-sm">
              Counts cannot exceed total trees.
            </div>
          )}
          
           <div className="pt-6 border-t border-gray-700">
              <h2 className="text-xl font-semibold mb-3">Quote History</h2>

              {savedQuotes.length === 0 ? (
                <p className="text-sm text-gray-400">No saved quotes yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {savedQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      onClick={() => loadQuote(quote)}
                      className={`border rounded p-3 text-sm cursor-pointer transition ${
                        selectedQuoteId === quote.id
                          ? "border-blue-500 bg-blue-950/30"
                          : "border-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-start font-semibold">
                        <div>
                          <span>{quote.quote_number}</span>
                          <span className="ml-2">{formatCurrency(quote.total)}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteId(quote.id)
                          }}
                          className="text-xs text-red-400 hover:text-red-300 mr-2 hover:underline"

                        >
                          Delete
                        </button>
                        {confirmDeleteId === quote.id && (
                          <div className="mt-2 flex items-center justify-between text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1">
                            <span className="text-gray-300">Are you sure?</span>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteQuote(quote.id)
                                  setConfirmDeleteId(null)
                                }}
                                className="text-red-400 hover:text-red-300 ml-2"
                              >
                                Yes
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmDeleteId(null)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        </div>

                        <div className="text-gray-400 mt-1">
                          {quote.customer_name || "No customer name"}
                        </div>

                        <div className="text-gray-500 text-xs">
                          {quote.quote_date || "No date"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>

        {result ? (
          <div className="relative space-y-6 border rounded p-6 shadow-sm print:border-0 print:rounded-none print:shadow-none print:p-0 print:min-h-[10in]">
            {selectedQuoteId && (
              <div className="mb-3 text-sm text-blue-400 font-medium print:hidden">
                Editing Quote {quoteNumber}
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-4 print:hidden">
              <button
                onClick={handleNewQuote}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                New Quote
              </button>

              <button
                onClick={handleSaveQuote}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                Save Quote
              </button>

              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Print / Save PDF
              </button>
            </div>

            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-5">
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Petra Services Complete Yard Care
                </h1>

                  <div className="flex justify-between mt-6 text-sm border-t border-gray-700 pt-4">

                    {/* LEFT — Client */}
                    <div className="space-y-1.5">
                      <p className="text-gray-400 uppercase tracking-wide text-xs">Client</p>
                      <p className="font-medium">{customerName}</p>
                      {address && (
                        <>
                          <p>{address.split(",")[0]}</p>
                          <p>{address.split(",").slice(1).join(",").trim()}</p>
                        </>
                      )}
                    </div>

                    {/* RIGHT — Quote + Contact */}
                    <div className="text-right space-y-1.5">
                      <p>
                        <span className="text-gray-400 text-xs uppercase">Date:</span>{" "}
                        {formatDisplayDate(quoteDate)}
                      </p>
                      <p>
                        <span className="text-gray-400 text-xs uppercase">Quote #</span>{" "}
                        <span className="font-medium">{quoteNumber}</span>
                      </p>
                   
                      {customerPhone && (
                        <p>
                          <span className="text-gray-400 text-xs uppercase">Phone:</span>{" "}
                          {customerPhone}
                        </p>
                      )}
                      {customerEmail && (
                        <p>
                          <span className="text-gray-400 text-xs uppercase">Email:</span>{" "}
                          {customerEmail}
                        </p>
                      )}
                    </div>

                  </div>
              </div>

              {logoUrl && (
                <div className="w-60 h-40 flex items-start justify-end mr-8">
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="font-semibold text-base mb-1">Scope of Work:</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {result?.scopeOfWork}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left py-3">Item</th>
                    <th className="text-left py-3">Description</th>
                    <th className="text-center py-3">Qty</th>
                    <th className="text-right py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/40">
                      <td className="py-3">{item.item}</td>
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-center">{item.quantity ?? "-"}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-700 w-80 ml-auto text-sm space-y-2">

              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(result.subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Discount</span>
                <span>({formatCurrency(discountAmount || 0)})</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal After Discount</span>
                <span>{formatCurrency(result.subtotalAfterDiscount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Emergency</span>
                <span>{formatCurrency(result.emergencyFee)}</span>
              </div>

              <div className="flex justify-between font-medium border-t border-gray-700 pt-3 mt-2">
                <span>Adjusted Subtotal</span>
                <span>{formatCurrency(result.adjustedSubtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(result.tax)}</span>
              </div>

              <div className="flex justify-between font-bold text-2xl border-t border-gray-700 pt-4 mt-3">
                <span>Grand Total</span>
                <span className="text-green-500">{formatCurrency(result.total)}</span>
              </div>

            </div>
               <div className="hidden print:flex absolute bottom-2 right-2 items-center gap-2 text-[10px] text-gray-500 italic opacity-70 pointer-events-none">
              <span>Powered by</span>
              <img
                src="/logo2.png"
                alt="SnapQuote Logo"
                className="h-4 w-auto opacity-70"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border rounded p-10 text-gray-400">
            Select a base service and enter the required quantity to preview the quote.
          </div>
        )}
        </div>
    </main>
  )
}
