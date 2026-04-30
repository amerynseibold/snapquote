/* =========================================================
   QUOTE TYPES
========================================================= */

export type TreeHeightTier =
  | "0-15 ft"
  | "15-30 ft"
  | "30-60 ft"
  | "60+ ft"

export type TreeCountsByHeight = Record<TreeHeightTier, number>

export type ManualItem = {
  description: string
  qty: string | number
  price: string | number
}

export type QuoteInput = {
  baseService: string
  treeCountsByHeight: TreeCountsByHeight
  difficultTreeCount: number
  hazardTreeCount: number
  stumpCount: number
  haulOffIncluded: boolean
  includeTax: boolean
  emergencyJob: boolean
  discountAmount: number
  manualItems?: ManualItem[]
}

export type PricingConfig = {
  services: Record<string, number>
  heightModifiers: Record<string, number>

  conditionModifiers: {
    difficultAccess: number
    hazardTree: number
    haulOff: number
  }

  settings: {
    taxRate: number
    emergencyRate: number
    stumpBasePrice: number
    additionalStumpPrice: number
  }
}

/* =========================================================
   QUOTE HISOTRY
========================================================= */

export type SavedQuote = {
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
  manual_items: {
    description: string
    qty: string | number
    price: string | number
  }[] | null
}

/* =========================================================
   QUOTE PREVIEW
========================================================= */

export type QuoteResult = {
  lineItems: {
    item: string
    description: string
    rate: number | null
    quantity: number | null
    total: number
  }[]
  subtotal: number
  subtotalAfterDiscount: number
  emergencyFee: number
  adjustedSubtotal: number
  tax: number
  total: number
  scopeOfWork: string
}

/* =========================================================
   CUSTOMER TYPE
   Used for autofill + customer lookup from Supabase
========================================================= */
export type Customer = {
  id: number
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  address: string | null
}