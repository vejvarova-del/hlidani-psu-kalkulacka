(() => {
  "use strict";

  const FORM_BASE_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSdwtmTavGvtUS5h-pptZmqkXLPV4kxAeTg-LLTQJYCN6HSdtw/viewform?usp=pp_url";
  const PRICE_ENTRY = "entry.1340763288";

  const MS_PER_HOUR = 60 * 60 * 1000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  const serviceRadios = [...document.querySelectorAll('input[name="service"]')];
  const sizeRadios = [...document.querySelectorAll('input[name="dogSize"]')];

  const homeOwnerFields = document.getElementById("home-owner-fields");
  const walkFields = document.getElementById("walk-fields");
  const sizeSection = document.getElementById("size-section");
  const ownerKmField = document.getElementById("owner-km-field");

  const startDateTime = document.getElementById("startDateTime");
  const endDateTime = document.getElementById("endDateTime");
  const ownerKm = document.getElementById("ownerKm");

  const walkStart = document.getElementById("walkStart");
  const walkEnd = document.getElementById("walkEnd");
  const walksPerDay = document.getElementById("walksPerDay");
  const walkKm = document.getElementById("walkKm");

  const emptyState = document.getElementById("empty-state");
  const calculation = document.getElementById("calculation");
  const errorMessage = document.getElementById("error-message");

  const summaryService = document.getElementById("summaryService");
  const summaryDuration = document.getElementById("summaryDuration");
  const summaryBase = document.getElementById("summaryBase");
  const summaryDiscount = document.getElementById("summaryDiscount");
  const summaryTravel = document.getElementById("summaryTravel");
  const summaryTotal = document.getElementById("summaryTotal");
  const discountRow = document.getElementById("discount-row");
  const travelRow = document.getElementById("travel-row");
  const formula = document.getElementById("formula");
  const reserveButton = document.getElementById("reserveButton");

  function getCheckedValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value ?? "";
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0
    }).format(Math.round(value));
  }

  function formatDateForForm(value) {
    if (!value) return "";
    const date = new Date(value);
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function setSelectedCards(radios) {
    radios.forEach((radio) => {
      radio.closest(".choice-card")?.classList.toggle("selected", radio.checked);
    });
  }

  function selectedService() {
    return getCheckedValue("service");
  }

  function updateVisibleFields() {
    const service = selectedService();
    const isWalk = service === "walk";
    const isOwner = service === "owner";

    homeOwnerFields.hidden = isWalk;
    walkFields.hidden = !isWalk;
    sizeSection.hidden = isOwner;
    ownerKmField.hidden = !isOwner;

    setSelectedCards(serviceRadios);
    calculate();
  }

  function resetResult() {
    emptyState.hidden = false;
    calculation.hidden = true;
    errorMessage.hidden = true;
    errorMessage.textContent = "";
  }

  function showError(message) {
    emptyState.hidden = true;
    calculation.hidden = true;
    errorMessage.hidden = false;
    errorMessage.textContent = message;
  }

  function getStayPriceTable(service) {
    if (service === "owner") {
      return PRICES.owner;
    }

    const size = getCheckedValue("dogSize");
    return PRICES.home[size];
  }

  function calculateStay(service) {
    if (!startDateTime.value || !endDateTime.value) {
      resetResult();
      return;
    }

    const start = new Date(startDateTime.value);
    const end = new Date(endDateTime.value);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      showError("Vyplňte prosím platný termín.");
      return;
    }

    if (end <= start) {
      showError("Vyzvednutí musí být později než předání.");
      return;
    }

    const totalHours = (end - start) / MS_PER_HOUR;
    const price = getStayPriceTable(service);

    let fullDays = 0;
    let remainingHours = 0;
    let basePrice = 0;
    let durationLabel = "";
    let formulaText = "";

    // Pobyt do 24 hodin se počítá přesně podle ceníku.
    if (totalHours <= 1) {
      basePrice = price.perHour;
      durationLabel = "do 1 hodiny";
      formulaText = `hodinová sazba ${formatPrice(price.perHour)}`;
    } else if (totalHours <= 12) {
      basePrice = price.upTo12Hours;
      durationLabel = "nad 1 hodinu až 12 hodin";
      formulaText = `sazba do 12 hodin ${formatPrice(price.upTo12Hours)}`;
    } else if (totalHours <= 24) {
      basePrice = price.per24Hours;
      durationLabel = "nad 12 hodin až 24 hodin";
      formulaText = `sazba do 24 hodin ${formatPrice(price.per24Hours)}`;
    } else {
      fullDays = Math.floor(totalHours / 24);
      remainingHours = totalHours - fullDays * 24;

      basePrice = fullDays * price.per24Hours;

      const durationParts = [`${fullDays}× 24 hodin`];
      const formulaParts = [`${fullDays} × ${formatPrice(price.per24Hours)}`];

      if (remainingHours > 0 && remainingHours <= 12) {
        const halfDayPrice = price.per24Hours * PRICES.halfDayShare;
        basePrice += halfDayPrice;
        durationParts.push(`do 12 hodin navíc`);
        formulaParts.push(`½ dne ${formatPrice(halfDayPrice)}`);
      } else if (remainingHours > 12) {
        basePrice += price.per24Hours;
        durationParts.push(`více než 12 hodin navíc`);
        formulaParts.push(`1 celý den ${formatPrice(price.per24Hours)}`);
      }

      durationLabel = durationParts.join(" + ");
      formulaText = formulaParts.join(" + ");
    }

    // Sleva 10 % se uplatní od 5 celých 24hodinových úseků.
    const discount =
      fullDays >= PRICES.discountFromFullDays
        ? basePrice * PRICES.discountRate
        : 0;

    const km = service === "owner" ? Math.max(0, Number(ownerKm.value) || 0) : 0;
    const travel = km * PRICES.travelPerKm;
    const total = basePrice - discount + travel;

    const serviceLabel =
      service === "home" ? "Hlídání u nás doma" : "Hlídání u majitele";

    renderResult({
      serviceLabel,
      durationLabel,
      basePrice,
      discount,
      travel,
      total,
      formulaText:
        formulaText +
        (discount > 0 ? ` − sleva ${formatPrice(discount)}` : "") +
        (travel > 0 ? ` + cestovné ${formatPrice(travel)}` : ""),
      formText: [
        `Služba: ${serviceLabel}`,
        `Termín: ${formatDateForForm(startDateTime.value)} – ${formatDateForForm(endDateTime.value)}`,
        `Rozsah: ${durationLabel}`,
        `Základní cena: ${formatPrice(basePrice)}`,
        discount > 0 ? `Sleva 10 %: −${formatPrice(discount)}` : "",
        travel > 0 ? `Cestovné: ${formatPrice(travel)}` : "",
        `Celkem: ${formatPrice(total)}`
      ].filter(Boolean).join(" | ")
    });
  }

  function dateOnlyToUtc(value) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  function calculateWalking() {
    if (!walkStart.value || !walkEnd.value) {
      resetResult();
      return;
    }

    const start = dateOnlyToUtc(walkStart.value);
    const end = dateOnlyToUtc(walkEnd.value);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      showError("Vyplňte prosím platný termín venčení.");
      return;
    }

    if (end < start) {
      showError("Datum do nesmí být dříve než datum od.");
      return;
    }

    const days = Math.floor((end - start) / MS_PER_DAY) + 1;
    const perDay = Math.max(1, Number(walksPerDay.value) || 1);
    const numberOfWalks = days * perDay;
    const km = Math.max(0, Number(walkKm.value) || 0);

    const basePrice = numberOfWalks * PRICES.walking.perWalk;
    const travel = numberOfWalks * km * PRICES.travelPerKm;
    const total = basePrice + travel;

    renderResult({
      serviceLabel: "Venčení",
      durationLabel: `${days} ${days === 1 ? "den" : days < 5 ? "dny" : "dní"}, ${perDay}× denně`,
      basePrice,
      discount: 0,
      travel,
      total,
      formulaText:
        `${numberOfWalks} × ${formatPrice(PRICES.walking.perWalk)}` +
        (travel > 0 ? ` + cestovné ${formatPrice(travel)}` : ""),
      formText: [
        "Služba: Venčení",
        `Termín: ${walkStart.value} – ${walkEnd.value}`,
        `Rozsah: ${days} dní, ${perDay}× denně`,
        `Počet venčení: ${numberOfWalks}`,
        `Cena venčení: ${formatPrice(basePrice)}`,
        travel > 0 ? `Cestovné: ${formatPrice(travel)}` : "",
        `Celkem: ${formatPrice(total)}`
      ].filter(Boolean).join(" | ")
    });
  }

  function renderResult(data) {
    errorMessage.hidden = true;
    emptyState.hidden = true;
    calculation.hidden = false;

    summaryService.textContent = data.serviceLabel;
    summaryDuration.textContent = data.durationLabel;
    summaryBase.textContent = formatPrice(data.basePrice);
    summaryDiscount.textContent = `−${formatPrice(data.discount)}`;
    summaryTravel.textContent = formatPrice(data.travel);
    summaryTotal.textContent = formatPrice(data.total);
    formula.textContent = data.formulaText;

    discountRow.hidden = data.discount <= 0;
    travelRow.hidden = data.travel <= 0;

    reserveButton.href =
      `${FORM_BASE_URL}&${PRICE_ENTRY}=${encodeURIComponent(data.formText)}`;
  }

  function calculate() {
    const service = selectedService();

    if (service === "walk") {
      calculateWalking();
    } else {
      calculateStay(service);
    }
  }

  [...serviceRadios, ...sizeRadios].forEach((radio) => {
    radio.addEventListener("change", () => {
      setSelectedCards(radio.name === "service" ? serviceRadios : sizeRadios);
      if (radio.name === "service") {
        updateVisibleFields();
      } else {
        calculate();
      }
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
  ].forEach((element) => {
    element.addEventListener("input", calculate);
    element.addEventListener("change", calculate);
  });

  setSelectedCards(serviceRadios);
  setSelectedCards(sizeRadios);
  updateVisibleFields();
})();
