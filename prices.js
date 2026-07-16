const PRICES = Object.freeze({
  home: Object.freeze({
    small: Object.freeze({ hourly: 50, halfDay: 150, fullDay: 300 }),
    medium: Object.freeze({ hourly: 50, halfDay: 200, fullDay: 400 }),
    large: Object.freeze({ hourly: 50, halfDay: 300, fullDay: 600 })
  }),

  owner: Object.freeze({
    hourly: 100,
    halfDay: 400,
    fullDay: 800
  }),

  walking: Object.freeze({
    perWalk: 150
  }),

  travelPerKm: 10,
  discountRate: 0.10,
  discountFromFullDays: 5,
  shortCareHours: 2
});
