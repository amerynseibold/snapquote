import type { PricingConfig, QuoteInput, QuoteResult } from "./types"

/* =========================================================
   CALCULATE QUOTE
========================================================= */

export function calculateQuote(
  input: QuoteInput,
  pricing: PricingConfig
): QuoteResult {
  /* ---------------------------------------------------------
     Input values
  --------------------------------------------------------- */
  const {
    baseService,
    treeCountsByHeight,
    difficultTreeCount,
    hazardTreeCount,
    stumpCount,
    haulOffIncluded,
    includeTax,
    emergencyJob,
    discountAmount,
    manualItems = [],
  } = input

  /* ---------------------------------------------------------
     Pricing values
  --------------------------------------------------------- */
  const basePrice = pricing.services[baseService] || 0

  const { difficultAccess, hazardTree, haulOff } =
    pricing.conditionModifiers

  const {
    taxRate,
    emergencyRate,
    stumpBasePrice,
    additionalStumpPrice,
  } = pricing.settings

  /* ---------------------------------------------------------
     Base calculations
  --------------------------------------------------------- */
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


  /* =========================================================
     TREE SERVICE LINE ITEMS
  ========================================================= */

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


  /* =========================================================
     SURCHARGE / ADD-ON CALCULATIONS
  ========================================================= */

  const difficultTotal = difficultAccess * difficultTreeCount
  const hazardTotal = hazardTree * hazardTreeCount
  const haulOffTotal = haulOffIncluded ? haulOff : 0

  let stumpTotal = 0

  if (stumpCount > 0) {
    stumpTotal = stumpBasePrice + (stumpCount - 1) * additionalStumpPrice
  }


  /* =========================================================
     SURCHARGE / ADD-ON LINE ITEMS
  ========================================================= */

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


  /* =========================================================
     MANUAL / ADDITIONAL LINE ITEMS
  ========================================================= */

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


  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)

  const safeDiscount = Math.min(discountAmount, subtotal)

  const subtotalAfterDiscount = subtotal - safeDiscount

  const emergencyFee = emergencyJob
    ? subtotalAfterDiscount * emergencyRate
    : 0

  const adjustedSubtotal = subtotalAfterDiscount + emergencyFee

  const tax = input.includeTax
    ? adjustedSubtotal * taxRate
    : 0

  const total = adjustedSubtotal + tax


   /* =========================================================
      SCOPE OF WORK (AUTO-GENERATED DESCRIPTION)
    ========================================================= */
    const scopeParts: string[] = []

    // Base service
    if (input.baseService) {
      scopeParts.push(`${input.baseService} services`)
    }

    // Tree counts by height
    const treeDescriptions = Object.entries(input.treeCountsByHeight)
      .filter(([_, count]) => Number(count) > 0)
      .map(([height, count]) => `${count} tree(s) (${height})`)

    if (treeDescriptions.length > 0) {
      scopeParts.push(`including ${treeDescriptions.join(", ")}`)
    }

    // Special conditions
    if (input.difficultTreeCount > 0) {
      scopeParts.push(`${input.difficultTreeCount} difficult access tree(s)`)
    }

    if (input.hazardTreeCount > 0) {
      scopeParts.push(`${input.hazardTreeCount} hazard tree(s)`)
    }

    // Stumps
    if (input.stumpCount > 0) {
      scopeParts.push(`stump grinding for ${input.stumpCount} stump(s)`)
    }

    // Haul-off
    if (input.haulOffIncluded) {
      scopeParts.push(`removal and haul-off of all debris`)
    }

    // Emergency
    if (input.emergencyJob) {
      scopeParts.push(`expedited/emergency service`)
    }

    // Manual items (additional work)
    if (input.manualItems && input.manualItems.length > 0) {
      const manualDescriptions = input.manualItems
        .filter((item) => item.description && Number(item.qty) > 0)
        .map(
          (item) =>
            `${item.qty} x ${item.description}`
        )

      if (manualDescriptions.length > 0) {
        scopeParts.push(`additional services including ${manualDescriptions.join(", ")}`)
      }
    }

    // Final formatted scope
    const scopeOfWork =
      scopeParts.length > 0
        ? `This quote covers ${scopeParts.join(", ")}. All work will be completed in a safe and professional manner, with attention to detail and proper site cleanup upon completion.`
        : ""


  /* =========================================================
     RETURN QUOTE RESULT
  ========================================================= */

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