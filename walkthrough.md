# Walkthrough - SattvicBites Administrative Separation & Client Side Enhancements

We have successfully divided the administrative console into four separate, standalone dashboard pages, applied the brand color palette (#6f8d9d, #9cb9ce, #93c5dd, #c67a8f, #ffccc9, #e6d480) with high contrast text, and resolved major client-side issues including payment QR displays, order time auto-detection, address validation, and the Special Dish placement bug.

---

## 📂 Core Changes Accomplished

### 1. Administrative Panel Split (4 Dashboard Pages)
- **[NEW] [AdminConfig.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/AdminConfig.jsx) (Page 1: Configurations)**:
  - Sequence of cards:
    1. **Daily Menu Edit**: Day and Night menu sections with separate roti, sabji, dal-rice, and image uploads.
    2. **Dropdown Options Management**: Allows appending/deleting options for Rotis, Sabjis, and Swaps for Day/Night, and includes a **Live Dropdown Preview** representing client customizer dropdown states.
    3. **Dynamic Time Cutoffs**: Setting lunch/dinner clocks.
    4. **Manage Community Polls**: WhatsApp-style poll questions and choices builder, fixing the toggling activation logic.
    5. **Manage Service Notifications**: Broacasting, muting, and deleting operational announcements.
- **[MODIFY] [AdminAnalytics.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/AdminAnalytics.jsx) (Page 2: Analytics & Testimonials)**:
  - **Mom's Target Production Tally**: Displays active undelivered tiffins, rotis count, and buttermilk cups required.
  - **Client Ratings Log**: Testimonial list with average rating displays.
- **[NEW] [AdminDispatch.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/AdminDispatch.jsx) (Page 3: Dispatch Control)**:
  - Separate active dispatch tables for **Vallabh Vidyanagar**, **Karamsad**, and **Special Dishes**.
  - Renders **full requests** and details (without truncation).
  - Offers **Accept** and **Decline** buttons (sending PUT `/api/orders/admin/approve/:id`).
  - Offers **Deliver** (sending PUT `/api/orders/admin/deliver/:id`) and **Deliver All** (sending PUT `/api/orders/admin/deliver-all`) buttons to automatically refresh active orders and archive them.
  - Collapsible **Past Ordered Archive** showing all delivered orders.
- **[NEW] [AdminPayments.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/AdminPayments.jsx) (Page 4: Payments & QR)**:
  - **Add & Update QR Code**: Interface to upload/update bank scanner QR code.
  - **Today's Payment Requests**: Displays all COD/Online payments received today.
  - **Past Payments Folder Archive**: Groups past days' payments into expandable folder accordions labeled by date.

### 2. Client Side Ordering Page Enhancements
- **[MODIFY] [OrderCustomizer.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/OrderCustomizer.jsx)**:
  - **Auto-selected Meal Type**: Auto-selects Lunch (Daytime) if ordering before 3 PM, otherwise Dinner (Nighttime).
  - **Dynamic Dropdown Selectors**: Added select boxes for **Roti Selection** and **Sabji Selection** loading options directly from the settings DB (e.g. for choosing between two sabjis).
  - **UPI payment scan & pay**: Renders the admin-uploaded bank QR code inside the payment modal. Removed the 12-digit reference ID input block, allowing clients to place orders immediately after scanning.
  - **Street Address Validation**: Forces clients to input their street, landmark, and house details, automatically joining it with their registered region (`user.city - user.pincode`) to provide the admin with a full address.

### 3. Client Side Home & Landing Enhancements
- **[MODIFY] [Landing.jsx](file:///C:/Internship%20Jinarth/SattvicBites/sattvicbites-frontend/src/pages/Landing.jsx)**:
  - Daily menu auto-updates showing daytime menu (if hour < 15) or nighttime menu (if hour >= 15).
  - Added placeholders: `The menu for day/night is still being decided we will let you know soon` if menu parameters are empty.
  - Added pictures to daily menu selections. Shows `Photos will be updated soon` if no image is uploaded.

---

## 🛠️ Verification & Build Status

We executed a production compilation of the React frontend using Vite:
```bash
npm run build
```
- **Result**: Success. All modules compiled successfully with no syntax warnings or import errors.
- **Outputs**:
  - `dist/index.html` (1.32 kB)
  - `dist/assets/index-C-3gJ0bm.css` (49.30 kB)
  - `dist/assets/index-BAUqygTm.js` (425.52 kB)

---

## 🚀 Render Deployment Fixes

### 1. Unified Endpoint Configuration (Completed)
- **Problem**: Previously, various frontend pages contained hardcoded `http://localhost:5000` endpoints in their Axios calls. When deployed to Render, these calls attempted to query a local port in the user's browser, resulting in connection failure and triggering the fallback error message `"Server error occurred during account registration."`.
- **Solution**: We refactored all frontend components (including `App.jsx`, `Register.jsx`, `Login.jsx`, `AdminLogin.jsx`, etc.) to use a dynamic `apiBase` variable prefix:
  `const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';`
  All Axios endpoint strings were converted to backtick literals using this prefix.

### 2. CORS Whitelisting (Completed)
- **Problem**: The backend whitelisted only `http://localhost:5173` for CORS requests, blocking connections from the production Render domain.
- **Solution**: Updated `server.js` to whitelist the production URL:
  ```javascript
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://sattvicbites-frontend.onrender.com'
    ],
    credentials: true
  }));
  ```

---

## 📋 Steps to Make the Deployed Site Work (Manual Action Required)

To make these changes active on your live Render site, follow these instructions:

### Step A: Push Local Code Changes to GitHub
Run the following commands in your project root terminal to push the local fixes to GitHub. Since Render auto-deploys from your repository, this will trigger a fresh build with the fixed code:
```bash
git add .
git commit -m "chore: configure dynamic API endpoints and CORS whitelist for Render deployment"
git push origin main
```

### Step B: Set Environment Variables on Render

#### 1. Backend Web Service (`sattvicbites-backend`)
Go to your Render Dashboard -> Select your Backend service -> Go to **Environment** tab and add:
- `MONGO_URI` = `mongodb+srv://Apexa:9ATlXdig3aTMiize@cluster0.fgo9lzs.mongodb.net/sattvicbites?appName=Cluster0`
- `JWT_SECRET` = `sattvic_bites_jwt_secret_token_key_987654321` (or your custom secret key)
- `ADMIN_EMAIL` = `admin@sattvicbites.com`
- `ADMIN_PASSWORD` = `admin123`

#### 2. Frontend Static Site (`sattvicbites-frontend`)
Go to your Render Dashboard -> Select your Frontend service -> Go to **Environment** tab and add:
- `VITE_API_BASE_URL` = `https://sattvicbites-backend.onrender.com`
- `VITE_MASTER_PASSKEY` = `sattvic_master_passkey_2026`

