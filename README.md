# Characters

A React Native app for browsing the [Rick and Morty API](https://rickandmortyapi.com/).

---

## Setup

```bash
yarn install

cd ios && pod install && cd ..
yarn ios

yarn android
```

**Requirements:** Node ≥ 22, JDK 17+, Android SDK API 29+

After changing app icons or splash assets, regenerate PNGs and rebuild natively:

```bash
yarn generate:brand
yarn ios   # or yarn android
```

---

## Screens

| Screen | Features |
|---|---|
| **Characters** | Infinite scroll, 300 ms debounced search, status/gender filters, animated hide-on-scroll header, pull-to-refresh, skeleton loaders |
| **Character Detail** | Large avatar, full metadata, favourite toggle (SQLite-persisted), horizontal episode list |
| **Episodes** | All episodes grouped by season, tap to see character avatars |
| **Locations** | Paginated locations with infinite scroll, tap to see residents |
| **Favourites** | 2-column grid, SQLite-backed, works offline once loaded |

---

## Libraries Used

| Library | Purpose |
|---|---|
| `@tanstack/react-query` | Data fetching — `useInfiniteQuery` for lists, `useQuery` for detail |
| `axios` | HTTP client with typed base instance and error interceptors |
| `@reduxjs/toolkit` + `react-redux` | Favourites state synced with SQLite |
| `@op-engineering/op-sqlite` | SQLite persistence for favourites |
| `@react-navigation/native` | Navigation container |
| `@react-navigation/bottom-tabs` | Bottom tab navigator |
| `@react-navigation/native-stack` | Stack navigators per tab |
| `react-native-screens` | Native screen components |
| `react-native-gesture-handler` | Required by React Navigation |
| `react-native-safe-area-context` | Safe area insets |
| `lucide-react-native` + `react-native-svg` | Tab and UI icons |

---

## Architecture

Feature-based folder structure:

```
src/
├── api/              # Axios instance
├── database/         # SQLite service (op-sqlite)
├── features/
│   ├── characters/   # List screen, detail screen, hooks, service
│   ├── episodes/     # Episodes screen, detail modal, hooks, service
│   ├── locations/    # Locations screen, detail modal, hooks, service
│   └── favourites/   # Favourites screen, Redux slice
├── navigation/       # AppNavigator, TabNavigator, route types
├── shared/
│   ├── components/   # FadeImage, skeleton loaders, ErrorScreen, EmptyState
│   └── hooks/        # useDebounce, useScrollHeader
├── store/            # Redux store
├── types/            # Character, Episode, Location, ApiResponse interfaces
└── utils/            # responsive.ts (ds/fs), colors.ts
```

Brand assets (SVG sources + generation script) live in `assets/brand/` and `scripts/generate-brand-assets.mjs`.

---

## Technical Requirements Met

- ✅ **TypeScript strict mode** — `tsconfig.json` has `strict: true`
- ✅ **New Architecture** — `newArchEnabled=true` in `android/gradle.properties`
- ✅ **Lazy Loading** — `React.lazy + Suspense` for all screens; `FadeImage` with skeleton placeholder and fade-in; skeleton loaders for lists
- ✅ **Debouncing** — Custom `useDebounce<T>` hook (no lodash), 300 ms debounce on search
- ✅ **React Query + Axios** — All API calls via typed axios instance; `useInfiniteQuery` for lists, `useQuery` for single records
- ✅ **Redux Toolkit + SQLite** — Redux for favourites; op-sqlite for persistence across restarts
- ✅ **Hide Header on Scroll** — `Animated` translateY via custom `useScrollHeader` hook
- ✅ **Feature-based code structure** — Organised by domain under `src/features/`
- ✅ **Error & Empty States** — `ErrorScreen` with retry, `EmptyState` for no results, offline detection
- ✅ **Unit Tests** — Tests for `useDebounce`, `favouritesSlice`, and `characterService`
- ✅ **Splash screen & app icon** — Native splash on Android/iOS with generated brand assets

---

## Running Tests

```bash
yarn test
yarn jest __tests__/useDebounce.test.ts
yarn jest __tests__/favouritesSlice.test.ts
yarn jest __tests__/characterService.test.ts
```

---

## Known Limitations

- Episode grouping on the detail screen uses a heuristic (~10 episodes per season); `EpisodesScreen` uses the exact `S01E01` code format
- Rick and Morty API rate limits (Cloudflare 429) can temporarily block image/API requests during heavy use
- `@op-engineering/op-sqlite` requires native modules; run `pod install` on iOS after first `yarn install`
