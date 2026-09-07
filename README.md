# Orange Store

React va zamonaviy CSS yordamida yaratilgan, berilgan rasmga asoslangan responsive bosh sahifa.

## Ishga tushirish

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

Qidiruv, kategoriya filtri, banner almashinuvi, mahsulot tafsilotlari, sevimlilar va savat React state orqali ishlaydi. Sahifa yangilanganda holat qayta tiklanadi. Login, to‘lov va navigatsiyadagi alohida sahifalar backendga ulanmagan. Mahsulot suratlari Unsplash’dan, shrift Google Fonts’dan yuklanadi; ular namuna rasmlaridir.

`지금 인기 상품` ostida 공동구매, kategoriya bannerlari, namunaviy sharhlar va bestseller bo‘limlari qo‘shilgan. Qo‘shma xarid tugmasi mahsulotni savatga qo‘shib, sahifadagi ishtirokchilar sonini yangilaydi. Yangi bo‘limlarning suratlari `public/images/` ichida saqlanadi; manbalar `public/images/SOURCES.md` faylida. Bo‘lim stillari `src/lower-sections.css`, komponenti `src/LowerSections.jsx`, ma’lumotlari `src/marketData.js` fayllarida.

Bestseller bo‘limidan so‘ng kupon, Kakao Channel va ekologiya bannerlari, e’lonlar, yordam tugmalari va kompaniya footeri mavjud (`src/StoreFooter.jsx`, `src/store-footer.css`). E’lonlar, aloqa raqami va kompaniya rekvizitlari rasmga asoslangan demo ma’lumotlardir. So‘rov formasi hech qanday ma’lumot yubormaydi; Kakao va ijtimoiy tarmoq tugmalari rasmiy do‘kon hisoblari ulanmaguncha mahalliy ma’lumot oynasini ochadi.

Asosiy banner `src/HeroBanner.jsx` va `src/hero-banner.css` orqali boshqariladi. To‘rtta slaydning fon, surat va matni birga almashadi; avtomatik aylanish oralig‘i 5 soniya. Strelkalar, nuqtalar, pauza/play, klaviatura va gorizontal swipe qo‘llab-quvvatlanadi. Sichqoncha banner ustida, klaviatura fokusi ichkarida yoki sahifa yashirin bo‘lganda aylanish to‘xtaydi. Reduced-motion yoqilganida avtomatik aylanish dastlab o‘chiq bo‘ladi. Banner CTA tugmalari tegishli mahsulot kategoriyasini ochadi.

## GitHub Pages

- Repository: `HMKHoldings/live_commerce`
- Pages source: **GitHub Actions** (Settings → Pages).
- Production base: `/live_commerce/`; local development remains at `/`.
- `.github/workflows/deploy.yml` builds with Node 22 and `npm ci`, then deploys `dist` on pushes to `main`. It can also be run manually from Actions.
- Public images and videos use `src/assetPath.js` so they resolve beneath the deployment base.
- Product links use `?product=ID`, which supports direct access and refresh on static hosting.

After reviewing changes, commit and push them. Watch **Actions → Deploy website to GitHub Pages**. The successful deployment URL appears under **Settings → Pages**.

Expected URL: https://hmkholdings.github.io/live_commerce/

Local production check: `npm run build`, then `npm run preview`; open http://localhost:4173/live_commerce/.

Reference: https://vite.dev/guide/static-deploy#github-pages