export const pricing = {
  basePricePerDay: 1000,
  discounts: [
    { minDays: 3, pricePerDay: 800 },
    { minDays: 7, pricePerDay: 750 },
  ],
  extraController: {
    basePricePerDay: 150,
    discounts: [
      { minDays: 3, pricePerDay: 100 },
      { minDays: 7, pricePerDay: 50 },
      { minDays: 15, pricePerDay: 25 },
    ],
  },
};
