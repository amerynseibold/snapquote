"use client"

import { useEffect, useState } from "react"
import type { ChangeEvent } from "react"
import { calculateQuote } from "@/features/quote/calculateQuote"
import { pricingConfig } from "@/features/quote/pricingConfig"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/features/quote/components/TopBar"
import { MobileActionBar } from "@/features/quote/components/MobileActionBar"
import { DuplicateToast } from "@/features/quote/components/DuplicateToast"
import { QuoteHistory } from "@/features/quote/components/QuoteHistory"
import type { Customer, SavedQuote } from "@/features/quote/types"
import { QuotePreview } from "@/features/quote/components/QuotePreview"
import { QuoteForm } from "@/features/quote/components/QuoteForm"


type TreeHeightTier = "0-15 ft" | "15-30 ft" | "30-60 ft" | "60+ ft"

export default function Home() {
  // ============================================================
  // STATE: company branding, quote info, customer info, job inputs
  // ============================================================
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
  const [includeTax, setIncludeTax] = useState(true)
  const [emergencyJob, setEmergencyJob] = useState(false)
  const [discountAmount, setDiscountAmount] = useState("")
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [logoFileName, setLogoFileName] = useState("")
  const [showDuplicateToast, setShowDuplicateToast] = useState(false)

  // Manual line items added outside the calculated pricing rules
  const [manualItems, setManualItems] = useState<
    { description: string; qty: string; price: string }[]
  >([])

  /* =========================================================
   CUSTOMER AUTOFILL STATE
   Stores matching customers while the user types a name
  ========================================================= */
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)

  /* =========================================================
   RECENT CUSTOMERS STATE
   Stores the most recently updated customers for quick selection
  ========================================================= */
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])


  // ============================================================
  // HELPERS: display formatting and small reusable utilities
  // ============================================================
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""

    const [year, month, day] = dateString.split("-")

    return `${month}-${day}-${year}`
  }

  // ============================================================
  // SAVED QUOTE ACTIONS: load, delete, and refresh quote history
  // ============================================================
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

  // Shared input styling used throughout the form
  const inputClass =
  "w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:h-10 md:text-sm"

  // Updates the tree count for one height tier without affecting the others
  const updateTreeCountByHeight = (tier: TreeHeightTier, value: string) => {
    setTreeCountsByHeight((prev) => ({
      ...prev,
      [tier]: value === "" ? "" : Number(value),
    }))
  }

  // Total trees across all height tiers
  const totalTreeCount: number = Object.values(treeCountsByHeight).reduce(
    (sum: number, value) => sum + (Number(value) || 0),
    0
  )

  // Converts a number into your quote format, such as P-001
  const formatQuoteNumber = (num: number) => {
    return `P-${String(num).padStart(3, "0")}`
  }

  // ============================================================
  // FORMATTERS: phone number and currency display
  // ============================================================
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

  const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
    /* =========================================================
      CUSTOMER AUTOFILL SEARCH
      Searches saved customers by name, email, address, or phone.
      Prevents blank/short searches from returning unrelated customers.
    ========================================================= */
    const fetchCustomerSuggestions = async (searchValue: string) => {
      const trimmedSearch = searchValue.trim()
      const normalizedPhoneSearch = searchValue.replace(/\D/g, "")

      if (trimmedSearch.length < 2 && normalizedPhoneSearch.length < 3) {
        setCustomerSearchResults([])
        return
      }

      setIsSearchingCustomers(true)

      const isPhoneSearch =
        normalizedPhoneSearch.length >= 3 && /^\d+$/.test(normalizedPhoneSearch)

      const searchFilter = isPhoneSearch
        ? `customer_phone.ilike.%${normalizedPhoneSearch}%`
        : `customer_name.ilike.%${trimmedSearch}%`

      const { data, error } = await supabase
        .from("customers")
        .select("id, customer_name, customer_phone, customer_email, address")
        .or(searchFilter)
        .order("updated_at", { ascending: false })
        .limit(5)

      setIsSearchingCustomers(false)

      if (error) {
        console.error("Error searching customers:", error)
        setCustomerSearchResults([])
        return
      }

    const filteredResults = ((data || []) as Customer[]).filter((customer) => {
      const search = trimmedSearch.toLowerCase()
      const phoneSearch = normalizedPhoneSearch

      const nameMatch = customer.customer_name?.toLowerCase().includes(search)
      const emailMatch = customer.customer_email?.toLowerCase().includes(search)
      const addressMatch = customer.address?.toLowerCase().includes(search)
      const phoneMatch = phoneSearch.length >= 3
        ? customer.customer_phone?.replace(/\D/g, "").includes(phoneSearch)
        : false

      return nameMatch || emailMatch || addressMatch || phoneMatch
    })

    setCustomerSearchResults(filteredResults)
    }

    /* =========================================================
      FIND CUSTOMER BY PHONE
      Auto-fills customer details after the phone field loses focus
    ========================================================= */
    const findCustomerByPhone = async (phoneValue: string) => {
      const normalizedPhone = phoneValue.replace(/\D/g, "")

      if (normalizedPhone.length < 10) return

      const { data, error } = await supabase
        .from("customers")
        .select("customer_name, customer_phone, customer_email, address")
        .eq("customer_phone", normalizedPhone)
        .order("updated_at", { ascending: false})
        .limit(1)

      if (error) {
        console.error("Error finding customer by phone:", error)
        return
      }

      if (data && data.length > 0) {
        const customer = data[0]

        setCustomerName(customer.customer_name || "")
        setCustomerPhone(
          customer.customer_phone
            ? formatPhoneNumber(customer.customer_phone)
            : ""
        )
        setCustomerEmail(customer.customer_email || "")
        setAddress(customer.address || "")
      }
    }

    /* =========================================================
   RECENT CUSTOMERS
   Loads the most recently updated customers for quick selection
    ========================================================= */
    const fetchRecentCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, customer_name, customer_phone, customer_email, address")
        .order("updated_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching recent customers:", error)
        setRecentCustomers([])
        return
      }

      setRecentCustomers((data || []) as Customer[])
    }

  // ============================================================
  // SUPABASE ACTIONS: logo upload and quote history fetch
  // ============================================================
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

  // ============================================================
  // EFFECTS: startup loading, toast timing, and service-specific resets
  // ============================================================
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
    fetchRecentCustomers()
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

  // ============================================================
  // DERIVED VALUES: validation gates and quote calculation result
  // ============================================================
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
        includeTax,
        emergencyJob,
        discountAmount: Number(discountAmount) || 0,
        manualItems,
      },
      pricingConfig
    )
    : null

  // ============================================================
  // FORM ACTIONS: save, start new quote, and duplicate selected quote
  // ============================================================
  const handleSaveQuote = async () => {
    if (!result) return

    // ================= VALIDATION =================
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

    /* =========================================================
      SAVE OR UPDATE CUSTOMER FOR AUTOFILL
      Prevents duplicate customers by matching name + phone + address.
      If a match exists, update it. If not, create a new customer.
    ========================================================= */
    const trimmedCustomerName = customerName.trim()
    const trimmedCustomerPhone = customerPhone.replace(/\D/g, "")
    const trimmedCustomerEmail = customerEmail.trim()
    const trimmedAddress = address.trim()

    const { data: existingCustomers, error: findCustomerError } = await supabase
      .from("customers")
      .select("id")
      .eq("customer_name", trimmedCustomerName)
      .eq("customer_phone", trimmedCustomerPhone)
      .eq("address", trimmedAddress)
      .limit(1)

    if (findCustomerError) {
      console.error("Error checking existing customer:", findCustomerError)
    } else if (existingCustomers && existingCustomers.length > 0) {
      const existingCustomerId = existingCustomers[0].id

      const { error: updateCustomerError } = await supabase
        .from("customers")
        .update({
          customer_email: trimmedCustomerEmail || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomerId)

      if (updateCustomerError) {
        console.error("Error updating existing customer:", updateCustomerError)
      }
    } else {
      const { error: insertCustomerError } = await supabase
        .from("customers")
        .insert([
          {
            customer_name: trimmedCustomerName,
            customer_phone: trimmedCustomerPhone,
            customer_email: trimmedCustomerEmail || null,
            address: trimmedAddress,
            updated_at: new Date().toISOString(),
          },
        ])

      if (insertCustomerError) {
        console.error("Error saving new customer:", insertCustomerError)
      }
    }

    // ================= SAVE QUOTE =================
    const { error } = await supabase.from("quotes").upsert([
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

    //Suggest next quote number for new quote  
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
    setManualItems([])

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


  // ============================================================
  // UI RENDER
  // ============================================================
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-gray-900 px-3 py-2 sm:p-3 md:p-4 xl:p-5 pb-32 md:pb-6 print:bg-white print:p-0">
      <div className="w-full max-w-[1120px] mx-auto space-y-4 sm:space-y-5">
        {/* Sticky app header - desktop only */}
        <TopBar
          quoteNumber={quoteNumber}
          onNew={handleNewQuote}
          onDuplicate={handleDuplicateQuote}
          onSave={handleSaveQuote}
          onPrint={() => window.print()}
          canDuplicate={!!selectedQuoteId}
          canSave={!!result}
        />

        {/* Main app layout
            Mobile order: Form > Preview > History
            Desktop order: Form > History > Preview
        */}
        <div className="grid grid-cols-1 xl:grid-cols-[800px_320px] gap-3 sm:gap-4 xl:gap-1 items-start">
          {/* Quote builder input form */}
          <div className="order-1 xl:order-1">
            <QuoteForm
              companyName={companyName}
              quoteNumber={quoteNumber}
              quoteDate={quoteDate}
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail}
              address={address}
              baseService={baseService}
              treeCountsByHeight={treeCountsByHeight}
              difficultTreeCount={difficultTreeCount}
              hazardTreeCount={hazardTreeCount}
              stumpCount={stumpCount}
              haulOffIncluded={haulOffIncluded}
              includeTax={includeTax}
              emergencyJob={emergencyJob}
              discountAmount={discountAmount}
              logoUrl={logoUrl}
              manualItems={manualItems}
              totalTreeCount={totalTreeCount}
              selectedQuoteId={selectedQuoteId}
              result={result}
              inputClass={inputClass}
              setCompanyName={setCompanyName}
              setQuoteNumber={setQuoteNumber}
              setQuoteDate={setQuoteDate}
              setCustomerName={setCustomerName}
              setCustomerPhone={setCustomerPhone}
              setCustomerEmail={setCustomerEmail}
              setAddress={setAddress}
              setBaseService={setBaseService}
              updateTreeCountByHeight={updateTreeCountByHeight}
              setDifficultTreeCount={setDifficultTreeCount}
              setHazardTreeCount={setHazardTreeCount}
              setStumpCount={setStumpCount}
              setHaulOffIncluded={setHaulOffIncluded}
              setIncludeTax={setIncludeTax}
              setEmergencyJob={setEmergencyJob}
              setDiscountAmount={setDiscountAmount}
              setManualItems={setManualItems}
              handleLogoUpload={handleLogoUpload}
              handleNewQuote={handleNewQuote}
              handleDuplicateQuote={handleDuplicateQuote}
              handleSaveQuote={handleSaveQuote}
              formatPhoneNumber={formatPhoneNumber}
              findCustomerByPhone={findCustomerByPhone}
              formatCurrency={formatCurrency}
              customerSearchResults={customerSearchResults}
              isSearchingCustomers={isSearchingCustomers}
              fetchCustomerSuggestions={fetchCustomerSuggestions}
              setCustomerSearchResults={setCustomerSearchResults}
              recentCustomers={recentCustomers}
            />
          </div>

          {/* Saved quote history */}
          <div className="order-3 xl:order-2 xl:sticky xl:top-20 xl:self-start">
            <QuoteHistory
              savedQuotes={savedQuotes}
              selectedQuoteId={selectedQuoteId}
              confirmDeleteId={confirmDeleteId}
              onLoadQuote={loadQuote}
              onSetConfirmDeleteId={setConfirmDeleteId}
              onDeleteQuote={deleteQuote}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Customer-facing quote preview / printable area */}
          <div className="order-2 xl:order-3">
            <QuotePreview
              result={result}
              selectedQuoteId={selectedQuoteId}
              quoteNumber={quoteNumber}
              companyName={companyName}
              customerName={customerName}
              customerPhone={customerPhone}
              customerEmail={customerEmail}
              address={address}
              quoteDate={quoteDate}
              logoUrl={logoUrl}
              discountAmount={discountAmount}
              onNewQuote={handleNewQuote}
              onDuplicateQuote={handleDuplicateQuote}
              onSaveQuote={handleSaveQuote}
              onPrint={() => window.print()}
              formatCurrency={formatCurrency}
              formatDisplayDate={formatDisplayDate}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="md:hidden fixed bottom-[72px] left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(result.total)}
          </span>
        </div>
      )}

      {/* Mobile action bar */}
      <MobileActionBar
        onNew={handleNewQuote}
        onDuplicate={handleDuplicateQuote}
        onSave={handleSaveQuote}
        onPrint={() => window.print()}
        disabled={!result}
        duplicateDisabled={!selectedQuoteId}
      />

      {/* Duplicate confirmation toast */}
      <DuplicateToast show={showDuplicateToast} />
    </main>
  )
}