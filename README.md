# Smart AI Expense Tracker

A full-stack, intelligent personal finance management application built with **React 19**, **JavaScript (JSX)**, **Tailwind CSS v4**, **Firebase** (Authentication & Firestore Database), and the **Google Gemini API** (`@google/genai`).

Smart AI Expense Tracker empowers users to track income and expenses, establish monthly category budgets, analyze financial health through interactive charts, and consult a context-aware **AI Financial Assistant** for personalized spending insights, trend analysis, and budget compliance checks.

---

## ✨ Features

### 🔐 Authentication
- **Email & Password Auth**: Secure user registration, login, and logout workflows powered by Firebase Authentication.
- **Protected Routing**: Automatic redirection for unauthenticated visitors and session persistence.
- **Password Reset**: Self-service email password recovery flow.
- **User Data Isolation**: Document-level Firestore security rules ensuring each user can only read, write, and query their own financial records.

### 💸 Expense Management
- **Expense Logging**: Record individual expenses with title, amount, category, date, payment method, merchant, and description notes.
- **Category Association**: Link expenses to standard or custom categories.
- **Search & Filtering**: Filter expenses by date ranges, category, payment method, or title keywords.
- **Full CRUD Operations**: Create, edit, inspect, and delete expense entries seamlessly.

### 💵 Income Management
- **Income Tracking**: Log income entries with title, amount, source/category, date, and notes.
- **Income Insights**: Monitor earnings over time to understand cash flow dynamics.
- **Full CRUD Operations**: Manage income logs with real-time updates across the dashboard.

### 🎯 Budget Management
- **Monthly Category Limits**: Set target monthly spending limits for specific expense categories.
- **Real-Time Progress Tracking**: Visual progress bars and status indicators showing percentage spent, remaining budget, and status:
  - **ON TRACK**: Spending is below or equal to budget limits.
  - **AT LIMIT**: Spending has reached exactly 100% of the budget.
  - **OVER BUDGET**: Spending has exceeded the allocated limit.
- **Overrun Alerts**: High-visibility warning badges when approaching or exceeding limits.

### 📊 Financial Dashboard
- **Financial Key Metrics**: Instant overview of Total Income, Total Expenses, Net Savings, and Savings Rate percentage.
- **Interactive Visualizations (Chart.js)**:
  - **Category Breakdown**: Doughnut / Pie charts illustrating spending distribution.
  - **Income vs. Expense Cash Flow**: Comparative bar / line charts.
- **Recent Activity Ledger**: Streamlined log of latest financial transactions.

### 🏷️ Categories
- **Default Suggestions**: Pre-loaded categories for common expenses (Food, Transport, Bills, Shopping, Entertainment, etc.) and income sources.
- **Custom Categories**: Add custom categories with unique names and income/expense classification.

### 🤖 AI Financial Assistant
- **Interactive AI Chat**: Conversation interface powered by Google Gemini API (`@google/genai`).
- **Real-Time Context Injection**: Automatically compiles the user's actual income, expenses, category spending, and budget performance into Gemini prompts.
- **Personalized Financial Insights**: Answers questions about monthly totals, category overspending, budget compliance, savings rates, and historical comparisons without fabricating data.

### 👤 User Profile & Settings
- **Profile Customization**: Update display names and account preferences.
- **System Settings**: Currency selection ($ USD, € EUR, £ GBP, etc.), session preferences, and notification defaults.

### 📦 Firebase Integration
- **Firebase Authentication**: User identity management and state syncing.
- **Cloud Firestore**: Scalable NoSQL cloud database storing user documents, expenses, income logs, budgets, and categories.

### 🚀 Other Features
- **Responsive Layout**: Mobile-first, desktop-optimized adaptive UI with a responsive collapsible sidebar and modern header.
- **Smooth Animations**: Motion animations (`motion/react`) for fluid modal and page transitions.
- **CSV Data Export**: Export financial records to CSV format for external analysis.

---

## 🤖 AI Financial Assistant

The **AI Financial Assistant** acts as a personal smart finance coach directly embedded into the application.

### Key Capabilities
- **Actual Financial Analysis**: Reads real-time aggregated data from the user's Firestore records (expenses, incomes, budgets, top categories).
- **Accurate Budget Reporting**: Compares actual category spending against set budget caps to report exact usage percentages and overspent amounts.
- **Smart Query Handling**: Answers natural language questions regarding financial performance.
- **Trend Identification**: Highlights top spending categories and largest individual purchases.
- **Non-Fabrication Safeguard**: Explicitly configured to use actual user numbers and state "I don't have enough data to answer that accurately" if information is unavailable.

*Disclaimer: The AI Financial Assistant provides automated informational insights based on user-entered logs and is not a substitute for professional financial advice.*

---

## 🛠️ Tech Stack

| Layer / Feature | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend Language** | JavaScript (ES6+ / JSX) | Pure React.js application (*No TypeScript used*) |
| **Frontend Framework** | React 19 (`19.0.1`) | Modern UI library with functional components and hooks |
| **Build Tool** | Vite 6 (`6.2.3`) | Fast ESM dev server and bundler |
| **Styling Framework** | Tailwind CSS v4 | Utility-first CSS framework with modern styling engine |
| **Icons & UI Elements** | Lucide React | Clean, scalable vector icon set |
| **Animations** | Motion (`motion/react`) | Declarative animation engine for React |
| **Data Visualization** | Chart.js & `react-chartjs-2` | Flexible HTML5 Canvas charting library |
| **Routing** | React Router v7 | Client-side page navigation & route guarding |
| **Authentication** | Firebase Auth (`12.17.1`) | User authentication service |
| **Database** | Cloud Firestore | NoSQL document-based persistent cloud storage |
| **AI SDK & Model** | `@google/genai` (`2.4.0`) | Official Google Gen AI SDK utilizing `gemini-3.6-flash` |

---

## 🏗️ Project Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                       React 19 Frontend                         │
│     (Vite + React Router v7 + Tailwind CSS v4 + Chart.js)       │
└──────────────┬──────────────────┬─────────────────┬─────────────┘
               │                  │                 │
               ▼                  ▼                 ▼
   ┌──────────────────────┐ ┌───────────┐ ┌───────────────────┐
   │ Firebase Auth        │ │ Firestore │ │ Gemini AI Service │
   │ (User Authentication)│ │ Database  │ │ (@google/genai)   │
   └──────────────────────┘ └───────────┘ └───────────────────┘
```

1. **User Authentication**: Handled on client load via Firebase Auth listeners (`onAuthStateChanged`).
2. **Data Sync**: Firestore services (`expenseService`, `incomeService`, `budgetService`, `categoryService`) perform asynchronous operations on user-bound collections.
3. **AI Context Pipeline**: `aiContextService.js` fetches and formats the current user's financial metrics into structured prompts sent to the `geminiService.js` wrapper.

---

## 📁 Project Structure

```text
/
├── .env.example              # Sample environment variable template
├── firebase-blueprint.json   # Firestore database schema blueprint
├── firestore.rules           # Security rules for Firestore collections
├── storage.rules             # Security rules for Firebase Storage
├── index.html                # Vite HTML entry point
├── package.json              # NPM manifest & script dependencies
├── vite.config.js            # Vite configuration
└── src/
    ├── App.jsx               # Top-level React App layout & routes
    ├── main.jsx              # React DOM entry point
    ├── index.css             # Tailwind CSS & global styles
    ├── components/
    │   ├── ai/               # AI Assistant chat interface
    │   ├── auth/             # Login, register, forgot password forms
    │   ├── budgets/          # Budget cards, progress bars & modals
    │   ├── categories/       # Category management UI
    │   ├── charts/           # Reusable Chart.js chart wrappers
    │   ├── common/           # UI elements (Buttons, Modals, Cards, Badges)
    │   ├── dashboard/        # Dashboard overview & summary widgets
    │   ├── expenses/         # Expense listing, modal forms & filters
    │   ├── income/           # Income listing & modal forms
    │   ├── landing/          # Public landing page components
    │   ├── layout/           # Navbar, Sidebar & Main App Layout
    │   ├── modals/           # Modal dialog overlays
    │   ├── reports/          # Financial report widgets
    │   └── transactions/     # Unified transaction ledger table
    ├── context/              # React Context Providers (AuthContext, AppContext)
    ├── firebase/             # Firebase SDK initialization & configuration
    ├── hooks/                # Custom hooks (useAuth, useFinancialData, etc.)
    ├── pages/                # Top-level route pages (Dashboard, Expenses, AI, etc.)
    ├── routes/               # Public & Protected route handlers
    ├── services/             # Firebase & Gemini API integration services
    │   ├── aiAssistantService.js
    │   ├── aiContextService.js
    │   ├── authService.js
    │   ├── budgetService.js
    │   ├── categoryService.js
    │   ├── expenseService.js
    │   ├── firestoreService.js
    │   ├── geminiService.js
    │   └── incomeService.js
    └── utils/                # Helper functions (Currency formatters, Date utilities)
```

---

## 🔐 Authentication & Data Security

1. **User Scope Enforcement**: Every expense, income, budget, and category record saved to Firestore automatically includes a `userId` field bound to `auth.currentUser.uid`.
2. **Firestore Security Rules**: Strictly enforced at the database level:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{collectionName}/{docId} {
      allow read, write: if request.auth != null 
        && (resource == null || resource.data.userId == request.auth.uid)
        && (request.resource == null || request.resource.data.userId == request.auth.uid);
    }
  }
}
```

3. **Client-Side Secrets Protection**: API keys are supplied via Vite environment variables (`VITE_*`). Sensitive user credentials are never logged or exposed in AI context prompts.

---

## ⚙️ Environment Variables

Copy `.env.example` to create a local `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=your_google_ai_studio_gemini_api_key
VITE_GEMINI_MODEL=gemini-3.6-flash
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- A **Firebase Project** with Authentication and Firestore enabled
- A **Google AI Studio API Key** for Gemini

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/smart-expense-tracker.git
cd smart-expense-tracker
npm install
```

### 2. Environment Setup
Create your environment configuration file:

```bash
cp .env.example .env
```

Fill in your actual Firebase and Gemini API keys in `.env`.

### 3. Development Server
Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your web browser.

### 4. Production Build
Compile static assets for production:

```bash
npm run build
```

The output will be placed in the `dist/` directory.

### 5. Preview Production Build
Preview the compiled build locally:

```bash
npm run preview
```

---

## 🔥 Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Register a **Web App** inside your Firebase project.
3. Enable **Authentication** with the **Email/Password** sign-in provider.
4. Enable **Cloud Firestore Database** in production mode.
5. Apply the security rules from `firestore.rules` under Firestore Security Rules.
6. Copy your web app config credentials into your `.env` file under `VITE_FIREBASE_*`.

---

## 🤖 Gemini / AI Setup

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Set `VITE_GEMINI_API_KEY` in your `.env` file.
3. Set `VITE_GEMINI_MODEL=gemini-3.6-flash` in your `.env` file.
4. The application uses the official `@google/genai` SDK to process financial analysis queries cleanly and securely.

---

## 🌐 Firebase Hosting

This project is ready for deployment via Firebase Hosting or Cloud Run.

### Deploying to Firebase Hosting:
1. Install the Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize hosting:
   ```bash
   firebase login
   firebase init hosting
   ```
   Select `dist` as your public directory and configure as a single-page app (rewrite all URLs to `/index.html`).
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 📊 Application Workflow

1. **Sign Up / Log In**: User authenticates via Firebase Auth.
2. **Dashboard Overview**: User views real-time metrics, income/expense charts, and budget health.
3. **Record Financials**: User logs earnings under Income and purchases under Expenses.
4. **Set Category Budgets**: User sets monthly caps for specific categories (e.g., Food = $50.00).
5. **Monitor Compliance**: Application updates spending progress bars, percentage used, and alerts when exceeding limits.
6. **Consult AI Assistant**: User asks the AI Financial Assistant questions like *"How am I doing on my budget?"* or *"What is my largest expense category?"*.
7. **Real-Time Data Persistence**: All records persist securely under the user's isolated Firestore partition.

---

## 💡 Example AI Questions

Users can ask the AI Financial Assistant questions such as:

- *"How am I doing on my budget?"*
- *"How much did I spend this month?"*
- *"What category do I spend the most on?"*
- *"How much did I save this month?"*
- *"Am I overspending in any category?"*
- *"Compare my spending this month with last month."*
- *"Give me a summary of my financial health."*

---

## 🧪 Testing / Verification

Manual Verification Checklist:
- [x] **Authentication**: User sign-up, sign-in, session persistence, and logout.
- [x] **Expense Operations**: Add, edit, list, filter, and delete expense entries.
- [x] **Income Operations**: Add, edit, list, and delete income entries.
- [x] **Budget Tracking**: Correct calculation of spent amounts, remaining balance, and usage percentage.
- [x] **Firestore Isolation**: Data stored with proper `userId` binding.
- [x] **AI Assistant Accuracy**: Gemini responds with real financial values ($50 budget, $5 spent => $45 left, 10% used, On Track).
- [x] **Build Validation**: Production compilation succeeds without errors (`npm run build`).

---

## 🚀 Deployment

To create a production build for any hosting platform (Netlify, Vercel, Firebase Hosting, Cloud Run):

```bash
npm run build
```

Ensure environment variables (`VITE_FIREBASE_*` and `VITE_GEMINI_*`) are set in your deployment platform's environment configuration.

---

## 🔒 Security Notes

- **Secret Key Protection**: Never commit `.env` files containing live keys to public version control.
- **Client-Side Environment Variables**: Only `VITE_` prefixed variables are exposed to Vite client bundles.
- **Database Rule Guardrails**: Always enforce `request.auth.uid == resource.data.userId` in Firestore rules to prevent unauthorized cross-tenant data access.

---

## 📝 Important Development Notes

- Built strictly with **JavaScript (JSX)** and React 19.
- Uses `@google/genai` for Gemini API communication with automatic fallback.
- Uses `@tailwindcss/vite` plugin for Tailwind CSS v4 setup.

---

## 📄 License

No license has been specified for this project.

---

## 👨‍💻 Author

Developed as an AI-powered personal finance management project.
