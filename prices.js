// Ceník Kalkulačky 2.0
// Při změně cen stačí upravit čísla v tomto souboru.

const PRICES = Object.freeze({
  home: Object.freeze({
    small: 300,
    medium: 400,
    large: 600
  }),

  owner: Object.freeze({
    per24Hours: 800
  }),

  walking: Object.freeze({
    perWalk: 150
  }),

  travelPerKm: 10,
  discountRate: 0.10,
  discountFromFullDays: 5,
  halfDayShare: 0.50
});
