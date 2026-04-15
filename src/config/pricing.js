export const pricing = {
  basePricePerDay: 900,
  discounts: [
    { minDays: 3, pricePerDay: 700 },
    { minDays: 7, pricePerDay: 500 }
  ],
  extraController: {
    basePricePerDay: 150,
    discounts: [
      { minDays: 3, pricePerDay: 100 },
      { minDays: 7, pricePerDay: 50 },
      { minDays: 15, pricePerDay: 25 }
    ]
  }
};
