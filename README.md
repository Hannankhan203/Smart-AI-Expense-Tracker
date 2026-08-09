# Smart Expense Tracker

A full-stack personal finance application built with **React 18**, **JavaScript (JSX)**, **Tailwind CSS**, and **Firebase** (Authentication, Firestore Database, and Storage). Designed for intuitive income and expense management, budget tracking, receipt attachment uploads, category customization, interactive analytics visualizers, and user profile management.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Email & Password Authentication**: Secure registration, login, and password reset workflows powered by Firebase Auth.
- **Protected Routes**: Automatic redirection and state-preservation for authenticated user sessions.
- **Re-Authentication Safeguards**: Confirmation with current credentials before executing email updates or permanent account termination.
- **Firestore Security Rules**: Strict document-level isolation ensuring users can only read, write, and query their own financial records (`request.auth.uid == resource.data.userId`).

### 💰 Financial Record Management
- **Expenses Tracker**: Record expenses with title, amount, category, date, payment method, merchant, notes, and receipt file upload.
- **Income Tracker**: Track multiple income sources with custom categories, recurring status, and date logs.
- **Receipt Attachment Scanner**: Upload receipt photos stored directly in Firebase Storage with image preview, zoom modal, and removal.
- **Unified Transactions Ledger**: Combined timeline view of all income and expense items with advanced search, category filters, type toggles, sorting, and pagination.

### 📊 Budgets & Custom Categories
- **Budget Caps**: Set monthly budget caps per category with real-time spending progress bars and warning badges (e.g., 85% spent warning, 100% overlimit alert).
- **Category Customization**: Create custom income and expense categories with color pickers and icon tags.

### 📈 Reports & Analytics Visualizers
- **Interactive Visualizations (Chart.js)**:
  - **Expense Category Breakdown**: Pie and Doughnut charts.
  - **Monthly Cash Flow Trends**: Line chart comparing total income vs. total expenses over time.
  - **Budget Compliance Comparison**: Bar chart comparing budget caps against actual spending per category.
- **Summary Cards & Exporting**: Net balance, savings rate calculation, cash flow ratio, and CSV export capabilities.

### 👤 Profile & Settings
- **Profile Customization**: Update display name, email address, avatar picture (stored in Firebase Storage with fallback), and account password.
- **Account Termination**: Permanent account deletion with re-authentication and cascade deletion of all user documents from Firestore collections.
- **System Settings**: Light/Dark theme switching, multi-currency formatting ($ USD, € EUR, £ GBP, etc.), session timeout configuration, and notification preferences.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 (JavaScript / JSX) |
| **Build Tool & Bundler** | Vite 6 |
| **Styling & Layout** | Tailwind CSS v4, Lucide React Icons |
| **Charts & Analytics** | Chart.js & `react-chartjs-2` |
| **Animations** | Motion (`motion/react`) |
| **Database & Auth** | Firebase Auth, Firestore Database, Cloud Storage |
| **Routing** | React Router v7 |

*Note: This application strictly utilizes modern JavaScript (`.js` / `.jsx`) without TypeScript.*

---

## 📁 Directory Structure

```text
/
├── public/                  # Static assets & public icons
├── src/
│   ├── components/          # Modular React UI Components
│   │   ├── auth/            # Auth forms & guarded routes
│   │   ├── budgets/         # Budget forms, list cards & deletion modals
│   │   ├── categories/      # Custom category forms & management
│   │   ├── charts/          # Chart.js wrappers (Pie, Line, Bar)
│   │   ├── common/          # Reusable UI controls (Button, Input, Card, Modal, Table, Toast)
│   │   ├── dashboard/       # Metric cards, recent activity & progress bars
│   │   ├── expenses/        # Expense tables, forms, filters & receipt uploader
│   │   ├── income/          # Income tables, forms & status badges
│   │   ├── layout/          # Main layout, Navbar & responsive Sidebar
│   │   ├── reports/         # Analytical chart widgets & export utilities
│   │   └── transactions/    # Combined transaction history & pagination controls
│   ├── context/             # AppContext, AuthContext & ToastContext providers
│   ├── firebase/            # Firebase SDK configuration & exports
│   ├── hooks/               # Custom React hooks (useAuth, useExpenses, useIncome, etc.)
│   ├── pages/               # Page view components (Dashboard, Expenses, Income, Budgets, etc.)
│   ├── routes/              # Protected & public route definitions
│   ├── services/            # Firestore & Storage CRUD operations
│   └── utils/               # Currency formatting, date parsers & export helpers
├── firebase-blueprint.json  # Data schema definition for Firestore collections
├── firestore.rules          # Security rules enforcing user data isolation
├── package.json             # NPM package manifest & scripts
└── README.md                # Project documentation
```

---

## ⚡ Installation & Local Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your machine.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root with your Firebase credentials (refer to `.env.example`):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔒 Firestore Security Rules

Deploy the following security rules to your Firebase Firestore project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile document rule
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User financial collections
    match /{collectionName}/{docId} {
      allow read, write: if request.auth != null 
        && (resource == null || resource.data.userId == request.auth.uid)
        && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
  }
}
```

---

## 📜 License & Credits

Developed as a modern CRUD and financial analytics portfolio project. Built with React and Firebase.
