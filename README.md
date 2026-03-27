# PlayTime Rentals - PS5 Booking System

A production-ready booking system for PS5 rentals built with React (Vite) and Firebase.

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Create a new project in [Firebase Console](https://console.firebase.google.com/).
   - Go to "Build" -> "Firestore Database" and create a database (Start in Test Mode for development).
   - Go to "Project Settings" and register a new Web App to get your Firebase config keys.
   - Copy `.env.example` to `.env` in this directory:
     ```bash
     cp .env.example .env
     ```
   - Fill in your actual Firebase keys in the `.env` file.

3. **Pricing Configuration:**
   - Open `src/config/pricing.js` to modify the base price, duration rules, discounts, and accessory pricing.

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## Vercel Deployment

This project is fully ready for Vercel.

1. Create a [Vercel](https://vercel.com/) account.
2. Install Vercel CLI or link your GitHub repository.
3. Import this project in Vercel.
4. **Environment Variables**: During the import process, copy all variables from your `.env` file into Vercel's Environment Variables section.
5. Click **Deploy**. Vercel will automatically detect Vite and configure the build settings.

## Developer Notes

- **Styling**: Made with Tailwind CSS. Theme (Dark/Light) logic is isolated in `src/components/ThemeToggle.jsx` and CSS Variables are in `src/index.css`.
- **Haptics**: Leverages standard `navigator.vibrate` throughout buttons and toggles. Ensure testing on supported mobile devices.
- **Firebase**: Bookings logic avoids duplicate reservations by comparing date ranges directly in `src/components/BookingCalendar.jsx` via `getBookedDates()`.
