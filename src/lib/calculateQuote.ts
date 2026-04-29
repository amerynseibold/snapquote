export type TreeCountsByHeight = {
  "0-15 ft": number
  "15-30 ft": number
  "30-60 ft": number
  "60+ ft": number
}

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

export function calculateQuote(input: QuoteInput, pricing: PricingConfig) {
  const {
    baseService,
    treeCountsByHeight,
    difficultTreeCount,
    hazardTreeCount,
    stumpCount,
    haulOffIncluded,
    emergencyJob,
    discountAmount,
    manualItems = [],
  } = input

  const basePrice = pricing.services[baseService] || 0
  const { difficultAccess, hazardTree, haulOff } = pricing.conditionModifiers
  const { taxRate, emergencyRate, stumpBasePrice, additionalStumpPrice } =
    pricing.settings

  const totalTreeCount = Object.values(treeCountsByHeight).reduce(
    (sum, count) => sum + count,
    0
  )

  const lineItems: {
    item: string
    description: string
    rate: number | null
    quantity: number | null
    total: number
  }[] = []

  if (baseService !== "Stump Grinding") {
    Object.entries(treeCountsByHeight).forEach(([heightTier, count]) => {
      if (count <= 0) return

      const heightModifier = pricing.heightModifiers[heightTier] || 0
      const rate = basePrice + heightModifier

      lineItems.push({
        item: baseService,
        description: `${heightTier} tree service`,
        rate,
        quantity: count,
        total: rate * count,
      })
    })
  }

  const difficultTotal = difficultAccess * difficultTreeCount
  const hazardTotal = hazardTree * hazardTreeCount
  const haulOffTotal = haulOffIncluded ? haulOff : 0

  let stumpTotal = 0
  if (stumpCount > 0) {
    stumpTotal = stumpBasePrice + (stumpCount - 1) * additionalStumpPrice
  }

  if (difficultTotal > 0) {
    lineItems.push({
      item: "Access Difficulty",
      description: "Difficult access surcharge",
      rate: difficultAccess,
      quantity: difficultTreeCount,
      total: difficultTotal,
    })
  }

  if (hazardTotal > 0) {
    lineItems.push({
      item: "Hazard Trees",
      description: "Hazard risk surcharge",
      rate: hazardTree,
      quantity: hazardTreeCount,
      total: hazardTotal,
    })
  }

  if (haulOffTotal > 0) {
    lineItems.push({
      item: "Haul-Off",
      description: "Debris removal service",
      rate: haulOff,
      quantity: 1,
      total: haulOffTotal,
    })
  }

  if (stumpTotal > 0) {
    lineItems.push({
      item: "Stump Grinding",
      description: "Standard stump grinding service",
      rate: null,
      quantity: stumpCount,
      total: stumpTotal,
    })
  }

  manualItems
    .filter((item) => item.description && item.qty && item.price)
    .forEach((item) => {
      const quantity = Number(item.qty) || 0
      const rate = Number(item.price) || 0

      if (quantity <= 0 || rate <= 0) return

      lineItems.push({
        item: "Additional",
        description: item.description,
        rate,
        quantity,
        total: quantity * rate,
      })
    })

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const safeDiscount = Math.min(discountAmount, subtotal)
  const subtotalAfterDiscount = subtotal - safeDiscount
  const emergencyFee = emergencyJob ? subtotalAfterDiscount * emergencyRate : 0
  const adjustedSubtotal = subtotalAfterDiscount + emergencyFee
  const tax = adjustedSubtotal * taxRate
  const total = adjustedSubtotal + tax

  let scopeOfWork = ""

  if (baseService === "Stump Grinding") {
    scopeOfWork = `Stump grinding for ${stumpCount} stump${
      stumpCount > 1 ? "s" : ""
    }.`
  } else {
    const heightSummary = Object.entries(treeCountsByHeight)
      .filter(([, count]) => count > 0)
      .map(([heightTier, count]) => {
        return `${count} ${heightTier} tree${count > 1 ? "s" : ""}`
      })
      .join(", ")

    scopeOfWork = `${baseService} for ${totalTreeCount} tree${
      totalTreeCount > 1 ? "s" : ""
    }${heightSummary ? ` (${heightSummary})` : ""}.`

    if (difficultTreeCount > 0) {
      scopeOfWork += ` Includes difficult access handling for ${difficultTreeCount} tree${
        difficultTreeCount > 1 ? "s" : ""
      }.`
    }

    if (hazardTreeCount > 0) {
      scopeOfWork += ` Includes hazardous tree handling for ${hazardTreeCount} tree${
        hazardTreeCount > 1 ? "s" : ""
      }.`
    }
  }

  if (haulOffIncluded) {
    scopeOfWork += " Haul-off service included."
  }

  if (emergencyJob) {
    scopeOfWork += " Emergency service included."
  }

  return {
    lineItems,
    subtotal,
    subtotalAfterDiscount,
    emergencyFee,
    adjustedSubtotal,
    tax,
    total,
    scopeOfWork,
  }
}