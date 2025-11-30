# Vexo Analytics Implementation Checklist (DigitizeApp App)

This checklist defines the exact steps to fully integrate Vexo Analytics using our service wrapper and to keep the integration privacy‑safe and maintainable.

Authoritative docs: [Vexo Docs](https://docs.vexo.co/), [Vexo Features](https://docs.vexo.co/features)


## 0) Ground rules

- Use the wrapper in `services/analyticsService.ts` only. Do not call the Vexo SDK directly from components/screens.
- Do not send PII in event payloads. We identify the device using a SHA‑256 hash of the user email.
- Environment variable: `EXPO_VEXO_API_KEY` (set different values for development and production in EAS cloud).
- Vexo requires Development Builds and cannot run in Expo Go.
- After installing or updating `vexo-analytics`, rebuild native apps (Android/iOS) and run a Development Build or EAS build (not Expo Go).


## 1) Environment and initialization

- [ ] Ensure EAS cloud variables are set:
  - Development: `EXPO_VEXO_API_KEY=<dev_key>`
  - Production: `EXPO_VEXO_API_KEY=<prod_key>`
- [ ] Verify one‑time init in `app/_layout.tsx` calls:
  - `initAnalytics(process.env.EXPO_VEXO_API_KEY || '')`
- [ ] (Optional per Vexo Quickstart) Gate analytics to production builds (`!__DEV__`) if desired.
- [ ] Ensure a Development Build or EAS build is used (Vexo does not run in Expo Go).
- [ ] After installing/upgrading `vexo-analytics`, rebuild native projects before testing.

Done when: app starts without errors on Dev Build and the first events appear in Vexo for the correct environment.


## 2) Wrapper API usage (reference)

File: `services/analyticsService.ts`
- `initAnalytics(apiKey: string)`
- `identifyUser(userIdOrEmail: string | null)` — hashes value before calling Vexo
- `setTrackingEnabled(enabled: boolean)`
- `trackEvent(name: string, props?: Record<string, unknown>)`


## 3) Identity and session

- [x] Identify after login using email (hashed) via `identifyUser(email)`
- [x] Anonymize on logout via `identifyUser(null)`
- [x] Re‑identify on app start/return when profile is restored (hashed email)

Files:
- `providers/AuthProvider.tsx` (wired)

Done when: returning users appear as the same person in Vexo sessions without sending raw email.


## 4) Consent and ATT

- [ ] Persist consent preference (non‑sensitive) in `AsyncStorage`
- [ ] On startup, before any analytics, read preference and call `setTrackingEnabled()`
- [x] Request ATT on iOS and map result to `setTrackingEnabled(true|false)`
- [ ] Add a Settings toggle that updates preference and calls `setTrackingEnabled()`

Files:
- `components/AppTrackingTransparencyWrapper.tsx` (ATT wired)
- Settings screen (to add): user‑visible toggle

Done when: tracking follows user preference and ATT, and persists across restarts.


## 5) Sensitive screens and redaction

- [ ] Disable analytics during these flows: `Otp`, `SetPassword`, payment/checkout forms
- [ ] Alternatively (if keeping session replays), ensure inputs/screens are redacted/masked
- [ ] If screenshots are captured by Vexo, disable them or ensure they are masked on sensitive screens (if supported in Vexo settings/UI).

Done when: no sensitive data is captured; replays/heatmaps respect privacy.


## 6) Event taxonomy (low‑cardinality, kebab‑case)

Implement with `trackEvent()` at the appropriate points:
- [ ] Onboarding: `onboarding-started`, `onboarding-completed`
- [ ] Discovery: `search-performed` { queryLen, filters }, `item-viewed` { category, priceBucket }
- [ ] Engagement: `item-favorited`, `chat-message-sent` { hasImage }
- [ ] Listing: `listing-started`, `listing-published` { category, imagesCount }
- [ ] Purchase: `purchase-started`, `purchase-succeeded`, `purchase-failed` { value, currency, itemsCount }
- [ ] AI: `ai-outfit-generated` { inputsCount }

Done when: funnels can be built from consistent events with small, non‑PII payloads.


## 7) Screen naming quality

- [ ] Ensure stable, human‑readable screen names for Expo Router routes (avoid dynamic IDs). If necessary, map route params to canonical names.

Done when: Vexo screens dashboard shows clean, stable names.


## 8) Network performance and errors

- [ ] Instrument HTTP client interceptors to time requests
  - Emit `api-request` { endpointGroup, statusClass, latencyBucket }
  - Emit `api-error` { endpointGroup, statusCode, isNetworkError }
- [ ] Centralize endpoint grouping (e.g., `/wardrobe/v1/items/*` → `wardrobe/items`)

Files:
- `services/http-client/*`

Done when: we can see latency distributions and error rates by endpoint group.


## 9) JS errors and exceptions

- [ ] Add global React Error Boundary near app root, emit `js-error` { screen, fingerprint, stackHash }
- [ ] Add a JS exception handler (fatal/unhandled), emit `js-exception` with a sanitized payload

Done when: non‑fatal and fatal JS issues appear in Vexo without PII.


## 10) Push notifications and deep links

- [ ] Emit `notification-received` { source }
- [ ] Emit `notification-opened` { source }
- [ ] Emit `deep-link-opened` { path }

Done when: we can attribute sessions to notifications and deep links.


## 11) Release/version analytics

- [ ] Confirm accurate `expo.version`/`runtimeVersion` in `app.config.js`
- [ ] Emit `first-open-on-version` { version } once per version per device

Done when: Version Adoption in Vexo matches our EAS release cadence.


## 12) Context enrichment (non‑PII)

- [ ] Add small, stable props where useful: locale, theme, plan type, feature flags, network type

Done when: segmentation is useful without leaking PII.


## 13) Webhooks and alerts

- [ ] Configure Vexo Webhooks to Slack/endpoint for surges in `purchase-failed`, `api-error-5xx`, `js-exception`

Done when: critical regressions surface automatically to the team.


## 14) Optional sampling

- [ ] Add opt‑in sampling in `services/analyticsService.ts` for noisy events (e.g., 10–20%)

Done when: event volume is manageable without losing signal.


## 15) Staging QA and production rollout

- [ ] Use separate `EXPO_VEXO_API_KEY` on staging
- [ ] Verify funnels, redaction, consent behavior on staging devices (iOS + Android)
- [ ] Enable in production after sign‑off

Done when: staging checks complete and production shows expected baselines.


## 16) People and data deletion workflows

- [ ] Confirm identities appear under Vexo "People" using hashed email
- [ ] Define an internal process to anonymize devices when users delete accounts: call `identifyUser(null)` and coordinate any required deletion in Vexo UI

Done when: user deletion requests can be actioned without retaining identifiers in analytics.


## 17) Auto‑tracked events verification

- [ ] Verify automatic events appear in Vexo without extra code: app open/close, screen changes, taps, typing, orientation changes
- [ ] Verify automatic network/error tracking appears (per Vexo features); keep custom API metrics for endpoint grouping/latency buckets as an addition

Done when: built‑in events are visible and align with expectations; custom metrics add clarity without duplication.


## References

- Quickstart and supported features: [Vexo Docs](https://docs.vexo.co/)
- Events, identity, opt‑in/out: [Vexo Features](https://docs.vexo.co/features)


