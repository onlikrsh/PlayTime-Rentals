# PlayTime Rentals

The PS5 rental website for Vizag, plus an **admin app** for your iPhone where you
manage bookings, dates, prices and money.

---

## How it works

```
  CUSTOMER                        BACKEND (Vercel)                     DATABASE (Firebase)
  ────────                        ────────────────                     ───────────────────
  Opens the website  ──────────▶  /api/availability  ◀── reads ─────  prices + taken dates
                                       (sends prices and taken dates, never customer details)

  Taps "Request booking" ──────▶  /api/book  ──── saves request ───▶  bookings
                                       │
                                       └── sends a notification ───▶  📱 your iPhone

  YOU (admin app on iPhone)  ──── confirm, block dates, prices, expenses ───▶  database
                                       (only your account is allowed in)
```

**A booking, start to finish:**

1. The customer picks dates and add-ons, then enters their **name, mobile number and area**.
2. The backend checks the dates are free, works out the price, and saves it as a **New** request.
3. Your iPhone gets a notification: *"New booking · PT-7K3QX · Ravi · 3 days from 18 Oct · ₹2,700"*.
4. The customer sees their booking ID and a button to send the details to you on WhatsApp.
5. You open the admin app and tap **Confirm**. Those dates now show as taken on the website.
6. Delivery day: tap **Delivered**, then **Mark paid** when they pay.
   Pickup day: tap **Returned**, and the dates free up again.

New requests do **not** block dates until you confirm them, so fake requests can't fill your calendar.

---

## The admin app

Open **yourwebsite.com/admin** and sign in.

| Tab | What it does |
|---|---|
| **Today** | Today's and tomorrow's deliveries and pickups with their times, whether the console is out or at home, and this month's earnings |
| **Bookings** | New / Upcoming / Out / Past. Confirm, decline, mark delivered or returned. Tap the price to change it (discount, late fee). Mark paid. ✏️ Edit dates, days, details or price. 🗑 Delete. One tap to call or WhatsApp the customer. Search by name, phone or booking ID |
| **Calendar** | See booked and blocked days. Block dates (servicing, personal use). Add a booking you took by phone, with any start and return time |
| **Revenue** | Revenue, profit, collected and still-to-collect for this month, last month, this year or all time. Bookings that are delivered but unpaid. Last 6 months. Add expenses (fuel, PS Plus, repairs) |
| **Prices** | Change prices, discounts, extra controller prices and the longest rental. Includes a price calculator. Changes show on the website within a minute |

**Notifications:** a new booking shows the customer, dates and price; tapping it opens that booking.
The PT Admin icon shows a red badge with the number of requests waiting, and around 7 AM you get a
☀️ summary of the day's deliveries and pickups (only when there's something on). Buttons give a light
haptic tap (iPhone iOS 18 or newer).

### Put it on your iPhone (with notifications)

1. On your iPhone, open **Safari** and go to **yourwebsite.com/admin**. It has to be Safari, not Chrome.
2. Tap the **Share** button, then **Add to Home Screen**, then **Add**.
3. Open **PT Admin** from your Home Screen and sign in.
4. Tap the **🔔 bell** at the top, then **Allow**.
5. Tap the bell again and choose **Send a test notification** to check it works.

You need iOS 16.4 or newer. You can do the same on more phones, for example a partner's.

---

## One-time setup

You do this once. It takes about 20 minutes. Nothing here costs money: Firebase's free plan is plenty.

### Step 1: Create the database (Firebase)

1. Go to **console.firebase.google.com**, click **Create a project**, name it e.g. `playtime-rentals`
   (you can turn Google Analytics off), then click **Create**.
2. **Database:** left menu **Build → Firestore Database → Create database**.
   - Location: **asia-south1 (Mumbai)**. This can't be changed later.
   - Choose **Start in production mode**, then **Create**.
3. **Security rules:** in Firestore, open the **Rules** tab. Delete everything there, paste in the
   contents of the `firestore.rules` file from this project, and click **Publish**.
4. **Your login:** left menu **Build → Authentication → Get started → Email/Password**, switch on **Enable**, then **Save**.
   - Open the **Users** tab, click **Add user**, and enter your email and a strong password.
   - Copy the **User UID** shown for your new user (a long code).
   - Open the **Settings** tab, then **Authorized domains**, then **Add domain**, and add your website address (e.g. `playtime-rentals.vercel.app`).
5. **Make yourself admin:** go back to **Firestore Database → Data → Start collection**.
   - Collection ID: `admins`, then **Next**.
   - Document ID: paste your **User UID**.
   - Add a field: `email` (type string), value = your email. Click **Save**.
6. **App settings:** click the ⚙️ gear (top left), then **Project settings**. Under **Your apps**, click the
   **`</>`** (Web) icon, name it `PlayTime Admin` and register it (skip Hosting). You'll see `apiKey`,
   `authDomain`, `projectId` and `appId`. Keep this page open for Step 3.
7. **Backend key:** in Project settings, open the **Service accounts** tab and click **Generate new private key**.
   A `.json` file downloads. **Keep it secret**: anyone with it can read your database. Never send it to anyone.

### Step 2: Create the notification keys

In a terminal in this project folder, run:

```bash
npm run make-keys
```

It prints a **Public Key** and a **Private Key**. You'll paste them in Step 3.

### Step 3: Add the settings to Vercel

In **vercel.com**, open your project, then **Settings → Environment Variables**, and add each of these:

| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` from Step 1.6 |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` from Step 1.6 |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` from Step 1.6 |
| `VITE_FIREBASE_APP_ID` | `appId` from Step 1.6 |
| `FIREBASE_SERVICE_ACCOUNT` | Open the `.json` file from Step 1.7 in a text editor and paste **all** of it |
| `VITE_VAPID_PUBLIC_KEY` | Public Key from Step 2 |
| `VAPID_PRIVATE_KEY` | Private Key from Step 2 |
| `VAPID_SUBJECT` | `mailto:` followed by your email, e.g. `mailto:you@gmail.com` |
| `CRON_SECRET` *(optional, recommended)* | Any long random password, e.g. from a password manager. Only Vercel's 7 AM timer can then send the morning summary |

Then open **Deployments**, click **⋯** on the latest one, and choose **Redeploy**. Settings only take effect after a redeploy.

### Step 4: Check it works

1. Open your website and make a test booking.
2. You should get a notification, and the booking appears in the admin app under **Bookings → New**.
3. Decline it when you're done.

---

## Changing things later

| What | Where |
|---|---|
| Prices, discounts, longest rental | Admin app → **Prices** (no code needed) |
| Blocked dates, phone bookings | Admin app → **Calendar** |
| WhatsApp number, delivery areas list | `src/config/site.js` |
| Starting prices (only used until you first save prices in the admin app) | `src/config/pricing.js` |
| Games shown on the website | `src/components/GameLibrary.jsx` |

## What's in this project

| Folder / file | What it is |
|---|---|
| `api/` | **The backend**: three short files (`book.js`, `availability.js`, `test-push.js`). Each one explains its steps in plain English at the top. `api/_lib/helpers.js` has the shared parts (database connection, prices, notifications). |
| `src/admin/` | The admin app's screens (one file per tab) |
| `src/` (everything else) | The customer website |
| `src/lib/booking.js` | Booking rules used everywhere: prices, dates, booking IDs, phone number checks |
| `firestore.rules` | Who may use the database (only accounts listed in `admins`) |
| `public/sw.js` | Shows notifications on your phone |
| `admin.html` | The admin app's page (opened at `/admin`) |
| `scripts/demo.js` | The `npm run demo` command |

## Try it on your computer (demo)

You can try everything with sample data before (or after) setting up Firebase.
Nothing touches your real bookings.

1. Install Java once (the local test database needs it). On Arch Linux:

   ```bash
   sudo pacman -S jre-openjdk
   ```

2. In a terminal in this project folder, install the project's packages (first time only):

   ```bash
   npm install
   ```

3. Start the demo:

   ```bash
   npm run demo
   ```

   The first start takes a few minutes. Your browser then opens the website, and the
   terminal shows the **admin address** and a **demo login**.
4. Try it: book on the website, then sign in at `/admin` and confirm the booking.
5. Press **Ctrl+C** in the terminal to stop. Everything resets, so the next demo starts fresh.

### Running it with your real Firebase

After the one-time setup, copy `.env.example` to a new file called `.env.local` and fill in the
same values as in Step 3. For `FIREBASE_SERVICE_ACCOUNT`, put the file's contents between single
quotes: `FIREBASE_SERVICE_ACCOUNT='{ ... }'`. `.env.local` is never uploaded to GitHub. Then run
`npm run dev` and open http://localhost:5173 (website) and http://localhost:5173/admin.
This uses your **real** database, so bookings you make there are real.

## If something doesn't work

- **No notifications on iPhone:** open the app from the **Home Screen icon**, not from Safari, and tap the bell.
  Check iPhone **Settings → Notifications → PT Admin** is allowed, and that the `VAPID_…` settings are in Vercel.
- **"…isn't an admin yet" after signing in:** the Document ID in the `admins` collection must exactly match your User UID (Step 1.5).
- **Website shows old prices or every date as free:** check the `FIREBASE_SERVICE_ACCOUNT` setting in Vercel, then redeploy.
  The website keeps working with the starting prices while this is fixed.
