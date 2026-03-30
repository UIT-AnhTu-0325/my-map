---
inclusion: auto
---

# MyMap Project Context

## Overview
MyMap is a React + TypeScript location management app with an interactive Leaflet map. Users can pin locations, track them with details (title, description, price, image, TikTok link), and mark them as "selling" or "sold."

## Tech Stack
- React 19 + TypeScript + Vite 8
- Firebase Firestore (data storage + auth)
- Leaflet / react-leaflet (interactive map)
- react-router-dom v7 (routing)
- Firebase Hosting (deployment)
- React Compiler (babel-plugin-react-compiler)

## Project Structure
- `src/App.tsx` — Root component with NavBar, routes (Map + Dashboard)
- `src/pages/MapPage.tsx` — Interactive Leaflet map, click-to-add locations, markers with popups
- `src/pages/Dashboard.tsx` — Stats grid (total, selling, sold, revenue), filterable item list
- `src/components/LocationModal.tsx` — Add/edit location form modal
- `src/components/LocationPopup.tsx` — Map marker popup content
- `src/components/LoginModal.tsx` — Login form modal
- `src/types.ts` — `Location` interface (id, lat, lng, title, description, price, imageUrl, tiktokUrl, status, createdAt)
- `src/store.ts` — Firestore CRUD operations for locations collection
- `src/firebase.ts` — Firebase app init, Firestore instance
- `src/auth.ts` — Login/logout with SHA-256 hashed passwords, localStorage session
- `src/AuthContext.tsx` — React context for auth state
- `src/utils.ts` — Utility functions (formatPrice, etc.)

## Key Behaviors
- Logged-in users can add/edit/delete locations and toggle selling/sold status
- Prices are masked for non-logged-in users
- Map remembers last view position in localStorage
- Map initializes to: saved view → latest location → user geolocation → default (Ho Chi Minh City)
- Sold markers have a distinct visual style (CSS class `sold-marker`)
- Firebase config loaded from env vars (VITE_FIREBASE_*)

## Auth
- Simple custom auth: username + SHA-256 hashed password stored in Firestore `users` collection
- Session tracked via localStorage key `my-map-auth`
- Not using Firebase Auth SDK

## Deployment
- Firebase Hosting (`.firebaserc`, `firebase.json` present)
- Build: `tsc -b && vite build` → outputs to `dist/`
