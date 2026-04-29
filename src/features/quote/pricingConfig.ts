import type { PricingConfig } from "./types"

/* =========================================================
   PRICING CONFIGURATION
   Central place to update SnapQuote pricing rules
========================================================= */

export const pricingConfig: PricingConfig = {
  /* ---------------------------------------------------------
     Base service prices
  --------------------------------------------------------- */
  services: {
    "Tree Trimming": 750,
    "Tree Removal": 950,
    "Stump Grinding": 600,
  },

  /* ---------------------------------------------------------
     Tree height pricing adjustments
     Added to the selected base service price
  --------------------------------------------------------- */
  heightModifiers: {
    "0-15 ft": -150,
    "15-30 ft": 0,
    "30-60 ft": 200,
    "60+ ft": 400,
  },

  /* ---------------------------------------------------------
     Job condition add-ons
  --------------------------------------------------------- */
  conditionModifiers: {
    difficultAccess: 250,
    hazardTree: 300,
    haulOff: 150,
  },

  /* ---------------------------------------------------------
     Global pricing settings
  --------------------------------------------------------- */
  settings: {
    taxRate: 0.0825,
    emergencyRate: 0.25,
    stumpBasePrice: 600,
    additionalStumpPrice: 100,
  },
}