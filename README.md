# Hlídání psů Jičín – Kalkulačka 2.0

Webová kalkulačka orientační ceny pro služby Hlídání psů Jičín.

## Soubory

- `index.html` – obsah stránky
- `style.css` – vzhled
- `prices.js` – ceník a nastavení výpočtů
- `script.js` – logika kalkulačky

## Úprava cen

Ceny se mění pouze v souboru `prices.js`.

## Zveřejnění přes GitHub Pages

1. Nahraj všechny soubory do hlavní větve repozitáře.
2. Otevři `Settings`.
3. V levém menu otevři `Pages`.
4. V části `Build and deployment` vyber `Deploy from a branch`.
5. Nastav větev `main` a složku `/ (root)`.
6. Klikni na `Save`.

Veřejná stránka bude obvykle na adrese:

`https://vejvarova-del.github.io/hlidani-psu-kalkulacka/`

## Poznámka k výpočtu pobytu

- Každých celých 24 hodin se účtuje plná denní sazba.
- Zbývající část pobytu po celých 24 hodinách se účtuje jako polovina denní sazby.
- Sleva 10 % se uplatní od 5 celých 24hodinových úseků.
- U hlídání u majitele a venčení se připočítává cestovné 10 Kč/km.
