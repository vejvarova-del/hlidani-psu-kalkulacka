(() => {
  "use strict";

  const FORM_BASE_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdwtmTavGvtUS5h-pptZmqkXLPV4kxAeTg-LLTQJYCN6HSdtw/viewform?usp=pp_url";
  const PRICE_ENTRY = "entry.1340763288";

  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  const serviceRadios = [...document.querySelectorAll('input[name="service"]')];
  const sizeRadios = [...document.querySelectorAll('input[name="dogSize"]')];

  const stayPanel = document.getElementById("stayPanel");
  const walkPanel = document.getElementById("walkPanel");
  const sizeSection = document.getElementById("sizeSection");
  const ownerKmField = document.getElementById("ownerKmField");

  const startDateTime = document.getElementById("startDateTime");
  const endDateTime = document.getElementById("endDateTime");
  const ownerKm = document.getElementById("ownerKm");

  const walkStart = document.getElementById("walkStart");
  const walkEnd = document.getElementById("walkEnd");
  const walksPerDay = document.getElementById("walksPerDay");
  const walkKm = document.getElementById("walkKm");

  const emptyState = document.getElementById("emptyState");
  const resultContent = document.getElementById("resultContent");
  const totalPrice = document.getElementById("totalPrice");
  const reserveButton = document.getElementById("reserveButton");
  const errorMessage = document.getElementById("errorMessage");

  function checked(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function money(value) {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0
    }).format(Math.round(value));
  }

  function selectCards(radios) {
    radios.forEach(radio => {
      radio.closest(".card")?.classList.toggle("selected", radio.checked);
    });
  }

  function resetResult() {
    emptyState.hidden = false;
    resultContent.hidden = true;
    errorMessage.hidden = true;
    errorMessage.textContent = "";
  }

  function showError(text) {
    emptyState.hidden = true;
    resultContent.hidden = true;
    errorMessage.hidden = false;
    errorMessage.textContent = text;
  }

  function showResult(total, details) {
    emptyState.hidden = true;
    errorMessage.hidden = true;
    resultContent.hidden = false;
    totalPrice.textContent = money(total);

    const prefilled = `${details} | Předpokládaná cena: ${money(total)}`;
    reserveButton.href =
      `${FORM_BASE_URL}&${PRICE_ENTRY}=${encodeURIComponent(prefilled)}`;
  }

  function updatePanels() {
    const service = checked("service");
    const isWalk = service === "walk";
    const isOwner = service === "owner";

    stayPanel.hidden = isWalk;
    walkPanel.hidden = !isWalk;
    sizeSection.hidden = isOwner;
    ownerKmField.hidden = !isOwner;

    selectCards(serviceRadios);
    calculate();
  }

  function priceTable(service) {
    if (service === "owner") return PRICES.owner;
    return PRICES.home[checked("dogSize")];
  }

  function calculateStay(service) {
    if (!startDateTime.value || !endDateTime.value) {
      resetResult();
      return;
    }

    const start = new Date(startDateTime.value);
    const end = new Date(endDateTime.value);

    if (end <= start) {
      showError("Vyzvednutí musí být později než předání.");
      return;
    }

    const hours = (end - start) / HOUR;
    const rate = priceTable(service);

    let base = 0;
    let fullDays = 0;
    let remainder = 0;

    if (hours <= PRICES.shortCareHours) {
      base = Math.ceil(hours) * rate.hourly;
    } else if (hours <= 12) {
      base = rate.halfDay;
    } else if (hours <= 24) {
      base = rate.fullDay;
    } else {
      fullDays = Math.floor(hours / 24);
      remainder = hours - fullDays * 24;
      base = fullDays * rate.fullDay;

      // Do 2 hodin po celých 24 hodinách se cena nezvyšuje.
      if (remainder > PRICES.shortCareHours && remainder <= 12) {
        base += rate.halfDay;
      } else if (remainder > 12) {
        base += rate.fullDay;
      }
    }

    const discount =
      fullDays >= PRICES.discountFromFullDays
        ? base * PRICES.discountRate
        : 0;

    const km = service === "owner"
      ? Math.max(0, Number(ownerKm.value) || 0)
      : 0;

    const travel = km * PRICES.travelPerKm;
    const total = base - discount + travel;

    const serviceName =
      service === "home" ? "Hlídání u nás doma" : "Hlídání u majitele";

    const sizeName = service === "home"
      ? ({
          small: "do 10 kg",
          medium: "11–25 kg",
          large: "nad 25 kg"
        }[checked("dogSize")])
      : "";

    const details = [
      `Služba: ${serviceName}`,
      sizeName ? `Velikost psa: ${sizeName}` : "",
      `Termín: ${startDateTime.value} až ${endDateTime.value}`,
      travel > 0 ? `Cestovné: ${money(travel)}` : ""
    ].filter(Boolean).join(" | ");

    showResult(total, details);
  }

  function dateUtc(value) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  function calculateWalk() {
    if (!walkStart.value || !walkEnd.value) {
      resetResult();
      return;
    }

    const start = dateUtc(walkStart.value);
    const end = dateUtc(walkEnd.value);

    if (end < start) {
      showError("Datum do nesmí být dříve než datum od.");
      return;
    }

    const days = Math.floor((end - start) / DAY) + 1;
    const perDay = Number(walksPerDay.value) || 1;
    const walks = days * perDay;
    const km = Math.max(0, Number(walkKm.value) || 0);

    const servicePrice = walks * PRICES.walking.perWalk;
    const travel = walks * km * PRICES.travelPerKm;
    const total = servicePrice + travel;

    const details = [
      "Služba: Venčení",
      `Termín: ${walkStart.value} až ${walkEnd.value}`,
      `${perDay}× denně`,
      travel > 0 ? `Cestovné: ${money(travel)}` : ""
    ].filter(Boolean).join(" | ");

    showResult(total, details);
  }

  function calculate() {
    const service = checked("service");
    if (service === "walk") calculateWalk();
    else calculateStay(service);
  }

  [...serviceRadios, ...sizeRadios].forEach(radio => {
    radio.addEventListener("change", () => {
      selectCards(radio.name === "service" ? serviceRadios : sizeRadios);
      radio.name === "service" ? updatePanels() : calculate();
    });
  });

  [
    startDateTime,
    endDateTime,
    ownerKm,
    walkStart,
    walkEnd,
    walksPerDay,
    walkKm
  ].forEach(element => {
    element.addEventListener("input", calculate);
    element.addEventListener("change", calculate);
  });

  selectCards(serviceRadios);
  selectCards(sizeRadios);
  updatePanels();
})();
