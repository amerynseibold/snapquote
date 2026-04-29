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
  manual_items: { description: string; qty: string | number; price: string | number }[] | null
}

type TreeHeightTier = "0-15 ft" | "15-30 ft" | "30-60 ft" | "60+ ft"

export default function Home() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("Petra Services Complete Yard Care")
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
  const [discountAmount, setDiscountAmount] = useState("")
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [logoFileName, setLogoFileName] = useState("")
  const [showDuplicateToast, setShowDuplicateToast] = useState(false)

  const [manualItems, setManualItems] = useState([
    { description: "", qty: "", price: "" }
  ])

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""

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

    setDiscountAmount(quote.discount_amount ? String(quote.discount_amount) : "")

    setManualItems(
      quote.manual_items && quote.manual_items.length > 0
        ? quote.manual_items.map((item) => ({
          description: item.description || "",
          qty: String(item.qty || ""),
          price: String(item.price || ""),
        }))
        : [{ description: "", qty: "", price: "" }]
    )

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
    "w-full h-9 bg-gray-50 text-gray-900 border border-gray-300 rounded-md px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

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
    setLogoFileName(file.name)

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
  total,
  manual_items
`)
      .order("created_at", { ascending: false })
      .limit(12)
    if (error) {
      console.error("Error fetching saved quotes:", error)
      return
    }

    setSavedQuotes((data || []) as SavedQuote[])
  }

  useEffect(() => {
    if (showDuplicateToast) {
      const timer = setTimeout(() => {
        setShowDuplicateToast(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [showDuplicateToast])

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
        discountAmount: Number(discountAmount) || 0,
        manualItems,
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
          discount_amount: Number(discountAmount) || 0,
          manual_items: manualItems.filter(
            (item) => item.description || item.qty || item.price
          ),
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
      "60+ ft": "",
    })
    setDifficultTreeCount("")
    setHazardTreeCount("")
    setStumpCount("")
    setHaulOffIncluded(true)
    setEmergencyJob(false)
    setDiscountAmount("")
    setManualItems([{ description: "", qty: "", price: "" }])

    setQuoteDate(new Date().toISOString().split("T")[0])

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

  const handleDuplicateQuote = async () => {
    setSelectedQuoteId(null)
    setConfirmDeleteId(null)

    // ✅ Clear customer info
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setAddress("")

    // Reset date
    setQuoteDate(new Date().toISOString().split("T")[0])

    const { data, error } = await supabase
      .from("app_settings")
      .select("next_quote_number")
      .eq("id", 1)
      .single()

    if (error) {
      console.error("Error fetching next quote number:", error)
      alert("Could not create duplicate quote number.")
      return
    }

    setQuoteNumber(formatQuoteNumber(data.next_quote_number))

    setShowDuplicateToast(true)
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
    <main className="min-h-screen bg-[#f5f6f8] text-gray-900 p-2 sm:p-3 md:p-4 xl:p-5 pb-24 sm:pb-20 print:bg-white print:p-0">
      <div className="max-w-[1500px] mx-auto space-y-4 sm:space-y-5 print:max-w-none print:space-y-0">
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
        <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 sm:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-lg font-semibold">Quote Builder</h2>
              <p className="text-xs text-gray-400 mt-1">Enter the job details, then review the quote preview below.</p>
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

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">

            {/* LEFT COLUMN (Quote + Pricing stacked) */}
            <div className="xl:col-span-3 space-y-3">

              {/* Quote Info */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quote Info</h3>
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

              {/* Pricing & Branding */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Pricing & Branding
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
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

                  <div>
                    <label className="block mb-1 text-sm">Discount</label>
                    <input
                      type="text"
                      placeholder="$0"
                      value={discountAmount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.]/g, "")
                        const parts = raw.split(".")
                        const cleaned = parts.length > 2 ? parts[0] + "." + parts[1] : raw
                        const limited = cleaned.includes(".")
                          ? cleaned.split(".")[0] + "." + cleaned.split(".")[1].slice(0, 2)
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

                  <div className="sm:col-span-2">
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
            </div>

            {/* MIDDLE COLUMN (Customer) */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 space-y-3 xl:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <div>
                  <label className="block mb-1 text-sm">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass}
                  />
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

            {/* RIGHT COLUMN (Job Details) */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm xl:col-span-6 xl:min-h-[160px]">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Job Details</h3>

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

              {baseService !== "Stump Grinding" && (
                <>
                  <div>
                    <label className="block font-semibold mb-3">Trees by Height</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(["0-15 ft", "15-30 ft", "30-60 ft", "60+ ft"] as TreeHeightTier[]).map((tier) => (
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
                    className={`grid grid-cols-[2fr_0.7fr_1fr_1fr_auto] gap-2 items-center pb-2 transition-colors duration-150 ${index !== manualItems.length - 1 ? "border-b border-gray-200" : ""
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
                      className={inputClass}
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
                      className={inputClass}
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

                    {/* ✅ LIVE TOTAL (THIS WAS MISSING PLACEMENT) */}
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
          {((difficultTreeCount || 0) > totalTreeCount || (hazardTreeCount || 0) > totalTreeCount) && (
            <div className="text-red-500 text-sm">Counts cannot exceed total trees.</div>
          )}
        </section>

        <section className="min-w-0 rounded-xl py-4 sm:py-6 px-0 sm:px-3 print:rounded-none print:py-0 print:px-0">
          {result ? (
            <div className="quote-print-area max-w-[850px] mx-auto space-y-4 border border-gray-200 bg-white text-black p-5 md:p-6 shadow-[0_12px_35px_rgba(15,23,42,0.18)] rounded-sm print:w-full print:max-w-full md:print:w-[7in] md:print:max-w-[7in] print:mx-auto print:overflow-visible print:border-0 print:shadow-none print:rounded-none print:p-0 print:bg-white">
              {selectedQuoteId && <div className="mb-3 text-sm text-blue-400 font-medium print:hidden">Editing Quote {quoteNumber}</div>}
              <div className="hidden sm:flex sm:justify-end gap-3 mb-4 print:hidden">
                <button
                  onClick={handleNewQuote}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm shadow-sm"
                >
                  New Quote
                </button>

                <button
                  onClick={handleDuplicateQuote}
                  disabled={!selectedQuoteId}
                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 px-3 py-2 rounded text-sm shadow-sm"
                >
                  Duplicate
                </button>

                <button
                  onClick={handleSaveQuote}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm shadow-sm"
                >
                  Save Quote
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm shadow-sm"
                >
                  Print / Save PDF
                </button>
              </div>

              <div className="mb-4 border-b border-gray-700 pb-4 print:mb-4 print:pb-4">
                <h1 className="text-2xl font-bold tracking-tight mb-4 print:text-lg">
                  {companyName}
                </h1>

                <div className="grid grid-cols-[1fr_1fr_70px] sm:grid-cols-[1.2fr_1fr_120px] xl:grid-cols-[1.2fr_1fr_140px] gap-3 sm:gap-8 items-start sm:items-stretch min-h-[90px] sm:min-h-[120px] text-xs sm:text-sm border-t border-gray-700 pt-4 print:grid-cols-[1.2fr_1fr_140px] print:gap-6 print:items-stretch print:min-h-[120px] print:pt-3">

                  {/* LEFT: CLIENT */}
                  <div className="space-y-1.5 h-full">
                    <p className="text-gray-400 uppercase tracking-wide text-xs">Client</p>
                    <p className="font-medium">{customerName}</p>

                    {address && (
                      <>
                        <p>{address.split(",")[0]}</p>
                        <p>{address.split(",").slice(1).join(",").trim()}</p>
                      </>
                    )}
                  </div>

                  {/* MIDDLE: DETAILS (RIGHT ALIGNED) */}
                  <div className="space-y-1.5 text-left h-full flex flex-col justify-start">
                    <p><span className="text-gray-400 text-xs uppercase">Date:</span> {formatDisplayDate(quoteDate)}</p>
                    <p><span className="text-gray-400 text-xs uppercase">Quote #</span> <span className="font-medium">{quoteNumber}</span></p>
                    {customerPhone && <p><span className="text-gray-400 text-xs uppercase">Phone:</span> {customerPhone}</p>}
                    {customerEmail && <p><span className="text-gray-400 text-xs uppercase">Email:</span> {customerEmail}</p>}
                  </div>

                  {/* RIGHT: LOGO (CENTERED VERTICALLY) */}
                  <div className="flex justify-start sm:justify-end items-center h-full print:justify-end">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Company logo"
                        className="max-h-24 max-w-[115px] sm:max-h-28 sm:max-w-[135px] object-contain"
                      />
                    )}
                  </div>

                </div>
              </div>

              <div className="mt-3 print:mt-2">
                <p className="font-semibold text-base mb-1">Scope of Work:</p>
                <p className="max-w-[90%] text-sm text-gray-400 leading-relaxed print:leading-normal">
                  {result?.scopeOfWork}
                </p>
              </div>

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full min-w-0 text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wide">
                      <th className="text-left py-1.5 sm:py-2 print:py-1 w-[22%]">Item</th>
                      <th className="text-left py-1.5 sm:py-2 print:py-1 w-[48%]">Description</th>
                      <th className="text-center py-1.5 sm:py-2 print:py-1 w-[12%]">Qty</th>
                      <th className="text-right py-1.5 sm:py-2 print:py-1 w-[18%]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result?.lineItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/40"><td className="py-1.5 sm:py-2 print:py-1">{item.item}</td><td className="py-1.5 sm:py-2 print:py-1">{item.description}</td><td className="py-1.5 sm:py-2 print:py-1 text-center">{item.quantity ?? "-"}</td><td className="py-1.5 sm:py-2 print:py-1 text-right font-medium">{formatCurrency(item.total)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-700 w-full sm:w-80 sm:ml-auto text-sm space-y-2 print:mt-2 print:pt-2 print:space-y-1 print:flex print:justify-end print:break-inside-auto">
                <div className="w-[3.1in] max-w-full ml-auto">

                  <div className="hidden print:block mb-2">
                    <div className="border-t border-gray-300 mb-2"></div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 bt-2 mb-2">Quote Summary</p>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(result.subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>Discount</span>
                    <span>({formatCurrency(Number(discountAmount) || 0)})</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Subtotal After Discount</span>
                    <span>{formatCurrency(result.subtotalAfterDiscount)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Emergency</span>
                    <span>{formatCurrency(result.emergencyFee)}</span>
                  </div>

                  <div className="flex justify-between font-medium border-t border-gray-700 pt-2 mt-1">
                    <span>Adjusted Subtotal</span>
                    <span>{formatCurrency(result.adjustedSubtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(result.tax)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-xl print:text-lg border-t border-gray-700 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span>{formatCurrency(result.total)}</span>
                  </div>

                  <div className="hidden print:block text-right pt-2 text-[8px] text-gray-500 italic opacity-70">
                    <span className="mr-2">Powered by</span>
                    <img
                      src="/logo2.png"
                      alt="SnapQuote Logo"
                      className="inline-block h-3 w-auto opacity-70 align-middle"
                    />
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center border border-gray-700 rounded p-10 text-gray-400 text-center">Select a base service and enter the required quantity to preview the quote.</div>
          )}
        </section>

        <section className="print:hidden bg-white border border-gray-200 shadow-sm rounded-xl p-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-gray-200 pb-4">
            <div><h2 className="text-xl font-semibold">Quote History</h2><p className="text-sm text-gray-400 mt-1">Open, edit, or delete recent saved quotes.</p></div>
          </div>

          {savedQuotes.length === 0 ? (
            <p className="text-sm text-gray-400">No saved quotes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {savedQuotes.map((quote) => (
                <div key={quote.id} onClick={() => loadQuote(quote)} className={`border rounded-lg p-4 text-sm cursor-pointer transition ${selectedQuoteId === quote.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <div className="flex justify-between items-start gap-3 font-semibold"><div><span>{quote.quote_number}</span><span className="ml-2 text-gray-700">{formatCurrency(quote.total)}</span></div><button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(quote.id) }} className="text-xs text-red-400 hover:text-red-300 hover:underline">Delete</button></div>
                  {confirmDeleteId === quote.id && <div className="mt-3 flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded px-2 py-2"><span className="text-gray-600">Are you sure?</span><div className="flex gap-2"><button onClick={(e) => { e.stopPropagation(); deleteQuote(quote.id); setConfirmDeleteId(null) }} className="text-red-400 hover:text-red-300">Yes</button><button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null) }} className="text-gray-500 hover:text-gray-900">Cancel</button></div></div>}
                  <div className="text-gray-600 mt-2">{quote.customer_name || "No customer name"}</div>
                  <div className="text-gray-500 text-xs mt-1">{quote.quote_date || "No date"}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] flex gap-2 sm:hidden print:hidden">
        <button onClick={handleNewQuote} className="flex-1 active:scale-95 transition-transform duration-100 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium">New</button>
        <button onClick={handleSaveQuote} disabled={!result} className="flex-1 active:scale-95 transition-transform duration-100 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium">Save</button>
        <button onClick={() => window.print()} disabled={!result} className="flex-1 active:scale-95 transition-transform duration-100 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-3 py-2 rounded text-sm font-medium">Export</button>
      </div>

      <div
        className={`fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 transform ${showDuplicateToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        Quote duplicated — ready to edit
      </div>
    </main>
  )
}