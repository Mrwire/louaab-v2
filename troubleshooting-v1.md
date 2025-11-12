# Troubleshooting V1 Execution Plan

> All tasks are designed for the remote target `ssh root@164.90.190.154` with project root `/var/www/louaab`. Each task should follow this cycle: (1) create or update code, (2) run `npm run build`, (3) if successful run `pm2 restart louaab`, (4) request manual QA confirmation.

## Bug 01 – Toy list items are not clickable
- [ ] Owner: Frontend
- Context: `src/app/jouets/page.tsx`, toy grid components
- Steps to reproduce: open Jouets list, attempt to click any toy card
- Expected: each card navigates to its detail route
- Plan: inspect overlay elements blocking pointer events; adjust z-index/pointer-events; add Playwright/RTL test for navigation if existing test suite permits
- Validation: manual click test on staging; automated: run `npm run lint`

## Bug 02 – Cart icon appears only when hovering image center
- [ ] Owner: Frontend UI
- Context: hover state on toy card image overlay
- Steps: hover anywhere on image; cart icon renders only when pointer overlaps icon position
- Expected: icon fades in when hovering image
- Plan: modify hover trigger to wrap image container; ensure animation triggers using CSS or variant state
- Validation: manual hover test desktop/mobile

## Bug 03 – Like (favorite) action fails
- [ ] Owner: Frontend + API
- Context: `components/favorite-button.tsx`, API endpoint in `src/app/api`
- Steps: click heart icon; no persisting feedback
- Expected: UI toggles instantly and persists on refresh
- Plan: confirm API route; review auth requirements; add optimistic update and error toast; fix backend toggle if failing
- Validation: manual toggle with logged-in user; inspect network tab

## Bug 04 – Toy list sorting incorrect
- [ ] Owner: Frontend Data
- Context: search/filter hooks for toys list
- Steps: choose price ascending/descending/recent; list order unchanged
- Expected: correct ordering per selection
- Plan: inspect sorting utility `lib/toys-data.ts`; ensure query params propagate; add unit test covering sort helper
- Validation: manual sort check; run `npm run test` if available

## Bug 05 – Card size toggle near search bar ineffective
- [ ] Owner: Frontend UX
- Context: layout toggle component near search input
- Steps: click list view button; thumbnails remain large
- Expected: toggle between compact and default layout
- Plan: implement CSS class toggle; persist preference in state
- Validation: manual toggle test desktop/mobile

## Bug 06 – Reset filters button broken
- [ ] Owner: Frontend State
- Context: filters component in Jouets page
- Steps: apply filters then click reset; filters persist
- Expected: filters cleared and list resets
- Plan: ensure context/provider resets state; verify query params cleared
- Validation: manual reproduction

## Bug 07 – Toy names mismatch photos
- [ ] Owner: Data integrity
- Context: data mapping `public/toys/toys-mapping.json`
- Steps: compare displayed name vs image
- Expected: correct pairing
- Plan: audit mapping file; align slug/name/image ids; script to verify pairs
- Validation: run audit script; spot-check UI

## Bug 08 – Product page stock display wording
- [ ] Owner: UX copy
- Context: product detail page template
- Steps: view any product; stock shows numeric quantity
- Expected: show simple status "En stock" or "Indisponible"
- Plan: adjust component logic to map quantity to status label
- Validation: manual check with in-stock/out-of-stock fixtures

## Bug 09 – Pack duration display with discount broken on desktop
- [ ] Owner: Frontend layout
- Context: packs listing grid/responsive CSS
- Steps: open packs page on desktop; layout misaligned
- Expected: consistent alignment per duration section
- Plan: review flex/grid styling; ensure discount badge positions correctly; capture before/after screenshot for QA
- Validation: manual desktop viewport test

## Bug 10 – Start date input needs date picker
- [ ] Owner: UX forms
- Context: booking/reservation flow
- Steps: inspect date field; free text input only
- Expected: date picker component with validation
- Plan: integrate date picker (e.g., `react-datepicker` or headless UI) already in stack; ensure locale `fr`
- Validation: manual selection; ensure mobile friendly

## Bug 11 – Total price calculation incorrect
- [ ] Owner: Pricing logic
- Context: cart summary component and pricing service `lib/pricing-service.ts`
- Steps: add items, review total; mismatch expected sum
- Expected: correct total including taxes/discounts
- Plan: replicate with known dataset; review pricing formula; add unit tests for totals
- Validation: automated test covering regression; manual cart scenario

## Bug 12 – Buttons/text/promo colors must use brand green
- [ ] Owner: Design system
- Context: global CSS variables in `src/app/globals.css`
- Steps: review CTA/promo elements; inconsistent color
- Expected: brand green from logo
- Plan: extract hex from assets; update CSS variables and components; ensure contrast compliance
- Validation: visual review; run `npm run lint:css` if available

## Bug 13 – Text updates at multiple locations
- [ ] Owner: Content
- Context: multiple pages require new copy
- Steps: gather copy list from stakeholder
- Expected: updated text per brief
- Plan: request copy spreadsheet; apply updates; ensure translations consistent
- Validation: stakeholder review checklist

## Bug 14 – Category sidebar adjustments (Age and price)
- [ ] Owner: IA/UX
- Context: left sidebar structure on list pages
- Steps: review current categories sidebar; layout issues
- Expected: organized filters for age/price as specified
- Plan: redesign component; align spacing; test responsive behavior
- Validation: manual UI review

## Bug 15 – Add delivery address collection in cart
- [ ] Owner: Checkout
- Context: cart/checkout flow
- Steps: no address entry during checkout
- Expected: form to capture delivery address before confirmation
- Plan: add form fields; persist to backend; update DTOs
- Validation: submit order; verify address stored; update e2e if available

## Question 01 – Excel database import process
- [ ] Owner: Ops documentation
- Context: need clear procedure for Excel data ingestion
- Plan: review backend scripts; document CLI or admin flow; include sample command
- Deliverable: doc section appended to `README.md` or new `docs/import.md`

## Question 02 – Order number generation flow
- [ ] Owner: Backend architecture
- Context: understand how order IDs get created
- Plan: audit `backend/` services; document logic; propose improvements if needed
- Deliverable: technical note summarizing current algorithm + recommendations

## Bug 16 – Add age/category emoticons on respective pages
- [ ] Owner: Frontend assets
- Context: `src/app/ages` and `src/app/categories`
- Steps: icons missing
- Expected: same emoticons used in "Comment ça marche" section
- Plan: reuse assets; ensure accessibility labels
- Validation: manual page check

## Bug 17 – Category page visual refresh
- [ ] Owner: UX redesign
- Context: `src/app/categories/page.tsx`
- Steps: page feels dull; duplicate sidebar
- Expected: align style with age page; remove redundant sidebar
- Plan: create new layout; remove sidebar; adjust grid
- Validation: visual review; responsive check

## Bug 18 – Delivery time selection removes items
- [ ] Owner: Cart state management
- Context: selecting delivery time mutates cart items
- Steps: choose any time in cart; items disappear
- Expected: cart items remain; time selection independent
- Plan: debug cart context; separate state; update reducer tests
- Validation: manual scenario; add regression test

## Bug 19 – Mobile shows double search icon instead of likes
- [ ] Owner: Responsive UI
- Context: mobile header icons
- Steps: open mobile view; two search icons
- Expected: one search icon and heart icon
- Plan: check conditional rendering; update icon mapping for mobile viewport
- Validation: mobile responsive test

## Bug 20 – Product page recap section removal
- [ ] Owner: Product detail UX
- Context: remove summary block "Location hebdomadaire/journaliere" and "Economies"
- Steps: open product page; section present
- Expected: section removed per brief
- Plan: delete component block; ensure layout adjusts
- Validation: manual page check

## Deployment Checklist
- [ ] After completing any task, run `ssh root@164.90.190.154 "cd /var/www/louaab && npm install"` if dependencies changed
- [ ] Always run `ssh root@164.90.190.154 "cd /var/www/louaab && npm run build"`
- [ ] On success, run `ssh root@164.90.190.154 "pm2 restart louaab"`
- [ ] Notify stakeholder for manual QA once server redeployed
