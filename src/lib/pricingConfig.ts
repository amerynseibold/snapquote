export const pricingConfig = {
  services: {
    "Tree Trimming": 750,
    "Tree Removal": 950,
    "Stump Grinding": 600
  },
  heightModifiers: {
    "0-15 ft": -150,
    "15-30 ft": 0,
    "30-60 ft": 200,
    "60+ ft": 400,
  },
  conditionModifiers: {
    difficultAccess: 250,
    hazardTree: 300,
    haulOff: 150,
  },
  settings: {
    taxRate: 0.0825,
    emergencyRate: 0.25,
    stumpBasePrice: 600,
    additionalStumpPrice: 100,
  },
}