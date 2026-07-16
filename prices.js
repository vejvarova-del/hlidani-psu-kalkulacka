// Ceník Kalkulačky 2.0
// Při změně cen stačí upravit čísla v tomto souboru.

const PRICES = Object.freeze({
  home: Object.freeze({
    small: Object.freeze({
      perHour: 50,
      upTo12Hours: 150,
      per24Hours: 300
    }),
    medium: Object.freeze({
      perHour: 50,
      upTo12Hours: 200,
      per24Hours: 400
    }),
    large: Object.freeze({
      perHour: 50,
      upTo12Hours: 300,
      per24Hours: 600
    })
  }),

  owner: Object.freeze({
    perHour: 100,
    upTo12Hours: 400,
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
