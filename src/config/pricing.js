// Default prices. Once prices are saved from the admin panel (/admin → Prices),
// the saved ones are used instead and this file is only a fallback.
export const defaultPricing = {
  basePricePerDay: 1000,
  discounts: [
    { minDays: 3, pricePerDay: 800 },
    { minDays: 7, pricePerDay: 650 },
  ],
  extraController: {
    basePricePerDay: 150,
    discounts: [
      { minDays: 3, pricePerDay: 100 },
      { minDays: 7, pricePerDay: 50 },
      { minDays: 15, pricePerDay: 25 },
    ],
  },
  maxDays: 7,
};

export const withDefaults = (saved) => ({
  ...defaultPricing,
  ...saved,
  extraController: { ...defaultPricing.extraController, ...saved?.extraController },
});
