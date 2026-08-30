# Bogura GPA Engine — School Result Processing & Transparent Audit System

---

## 🏷️ Metadata

| Field | Value |
|-------|-------|
| **Team ID** | `T047` |
| **Problem ID** | `P08` |
| **Problem Title** | School Result Calculation System |
| **Repository** | [github.com/Shaswata28/lsh26-t047-p08](https://github.com/Shaswata28/lsh26-t047-p08) |
| **Live URL** | _Deployed via Vercel — see below_ |
| **Tech Stack** | Next.js 16.3.3 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Supabase |

---

## 🚀 Live URL

> The application is deployable to Vercel. To run locally, follow the setup steps below.

If deployed, open: **`https://lsh26-t047-p08.vercel.app`**

---

## 🛠️ Setup & Run Steps

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A **Supabase** project (free tier is fine) with a `students` table

### 1. Clone the Repository

```bash
git clone https://github.com/Shaswata28/lsh26-t047-p08.git
cd lsh26-t047-p08
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> The Supabase `students` table schema is auto-upserted. No manual SQL migration is needed.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests

```bash
# Run all tests (unit + public dataset)
npm test

# Run unit tests only
npm run test:unit

# Run public dataset verification only
npm run test:dataset
```

### 6. Build for Production

```bash
npm run build
npm run start
```

---

## ✅ Requirements Coverage

### Core Functional Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Accept student mark input (CSV / spreadsheet) | ✅ Met | `SheetImporter.tsx` — upload CSV/TSV/Excel files or paste raw data |
| Accept individual student marks (one-by-one) | ✅ Met | `SingleStudentEntry.tsx` — full per-student entry form with live preview |
| Validate marks against allowed ranges (Theory ≤ 75, Practical ≤ 25, Total ≤ 100) | ✅ Met | `src/lib/validator.ts` — `parseAndValidateAnyInput()` |
| Report exact rejection reasons for invalid rows | ✅ Met | Detailed rejection table: row #, field, invalid value, reason, fix suggestion |
| Compute per-subject Grade Points (GP) using Bangladesh SSC scale | ✅ Met | `src/lib/gpaEngine.ts` — `getGradePoint()` |
| Dual-pass rule for practical subjects (Theory ≥ 25, Practical ≥ 8) | ✅ Met | `gpaEngine.ts` — `isPracticalPassed()` |
| 4th Optional Subject bonus: `max(0, GP_4th − 2.00)` | ✅ Met | `gpaEngine.ts` — `optionalBonusGP` calculation |
| Final GPA = (Compulsory GP Sum + Bonus) / 6 | ✅ Met | `gpaEngine.ts` — `calculateStudentResult()` |
| Student fails if any compulsory subject has GP 0 | ✅ Met | `gpaEngine.ts` — `isPassed` flag using `failedCompulsorySubjects` |
| Absent students are handled and marked as failed | ✅ Met | `isAbsent: true` → GP 0, not counted, `isPassed: false` |
| Master results table with all students | ✅ Met | `src/app/page.tsx` — sortable, filterable result table |
| Individual student marksheet / detailed view | ✅ Met | `src/app/marksheet/[id]/page.tsx` — print-ready marksheet |
| Audit/trace trail per student | ✅ Met | `src/app/trace/[id]/page.tsx` and `src/app/audit/page.tsx` |
| Class analytics and performance summary | ✅ Met | `src/app/analytics/page.tsx` — GPA distribution, pass rates |
| Verify against public dataset P08 (1,765 students, 25 cases) | ✅ Met | `scripts/test-public-dataset.ts` — 100% audit pass |
| Download CSV template | ✅ Met | `getSampleCsvTemplate()` in `validator.ts` |

### Grading Scale Implemented

| Marks Range | Grade | Grade Point |
|-------------|-------|-------------|
| 80 – 100 | A+ | 5.00 |
| 70 – 79 | A | 4.00 |
| 60 – 69 | A- | 3.50 |
| 50 – 59 | B | 3.00 |
| 40 – 49 | C | 2.00 |
| 33 – 39 | D | 1.00 |
| 0 – 32 | F | 0.00 |

---

## 🏗️ Architecture & Major Design Decisions

### 1. Deterministic Two-Pass GPA Engine

The entire GPA calculation is implemented as a pure TypeScript function in [`src/lib/gpaEngine.ts`](src/lib/gpaEngine.ts). It is completely stateless and deterministic — given the same student data, it always produces the same result. This was a deliberate choice to make the system easily testable against the P08 public dataset.

### 2. Dynamic HMT ↔ BIO Swapping

The 4th optional subject determines the composition of the 6 compulsory subjects:
- If 4th Optional = **Higher Mathematics (HMT)** → **Biology (BIO)** is compulsory (Section B)
- If 4th Optional = **Biology (BIO)** → **Higher Mathematics (HMT)** is compulsory (Section B)

This swapping logic is enforced in both the GPA engine and the single-entry form, preventing any chance of a subject appearing in both compulsory and optional positions simultaneously.

### 3. Strict Dual-Pass Enforcement

Practical subjects (PHY, CHE, BIO, HMT) require **both**:
- Theory mark ≥ 25 (out of 75)
- Practical mark ≥ 8 (out of 25)

Failure in either component overrides the total-mark grade to **F (GP 0.0)** regardless of total marks. A student with Theory=60, Practical=5 gets GP 0 despite 65/100 total.

### 4. Supabase as the Persistence Layer

Student records are stored in a Supabase PostgreSQL table using upsert operations keyed on `(roll, class)`. This enables real-time persistence without requiring a separate backend server.

### 5. Separation of Validation and Import

The spreadsheet importer performs validation as a completely separate step from database import. The user must explicitly click **"Validate & Check Errors"** before any data can be saved — preventing accidental import of malformed data.

### 6. Live Real-Time GPA Preview

The `SingleStudentEntry` component computes the full GPA in real-time using `useMemo` as marks are typed, with no debouncing. This is safe because the GPA engine is O(n) on the number of subjects (always 7) — effectively O(1) per keystroke.

---

## ⚠️ Known Limitations

| # | Limitation | Notes |
|---|-----------|-------|
| 1 | **Excel (.xlsx) binary format not supported** | CSV/TSV text format is required. Microsoft Excel files must be exported as CSV first (File → Save As → CSV). |
| 2 | **Only Science Group supported** | The system is built for the Science group curriculum (PHY, CHE, BIO/HMT). Humanities and Commerce groups have different subject structures that are not yet implemented. |
| 3 | **Single session (2025–2026) hardcoded** | The academic session is fixed. Multi-session support would require a session selector and updated data schema. |
| 4 | **No authentication** | Anyone with the URL can view, modify, or delete student records. For production use, Supabase Row Level Security (RLS) policies and user authentication must be configured. |
| 5 | **Supabase free tier cold starts** | On the Supabase free tier, the first database request after a period of inactivity may take 1–3 seconds due to instance cold starts. |
| 6 | **No PDF export for marksheets** | The marksheet page is print-ready (CSS `@media print` styles are applied) but does not have a one-click PDF download button. Users can use browser Print → Save as PDF. |
| 7 | **Browser cache / Turbopack stale chunks** | In development mode, after significant code changes, a hard refresh (`Ctrl+Shift+R`) may be needed to clear stale Turbopack HMR chunks. This is a known Next.js Turbopack dev-mode behavior. |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Master results dashboard
│   ├── import/page.tsx       # Batch CSV import + Single student entry
│   ├── audit/page.tsx        # Office checking desk with flagged records
│   ├── analytics/page.tsx    # Class performance analytics
│   ├── marksheet/[id]/       # Individual student marksheet (print-ready)
│   └── trace/[id]/           # Per-student audit trail
├── components/
│   ├── Navbar.tsx            # Sticky top navigation bar
│   ├── SheetImporter.tsx     # CSV/spreadsheet batch upload and validation
│   ├── SingleStudentEntry.tsx # One-by-one student mark entry form with live GPA
│   └── StudentTable.tsx      # Sortable, filterable results table
└── lib/
    ├── gpaEngine.ts          # Core GPA calculation engine (pure, deterministic)
    ├── validator.ts          # CSV/JSON parsing and mark validation
    ├── supabaseClient.ts     # Supabase CRUD operations
    └── types.ts              # TypeScript type definitions

scripts/
├── test-engine.ts            # Unit tests for GPA engine edge cases
└── test-public-dataset.ts    # Verification against P08 public dataset (1,765 students)

public/
├── P08_school_results_public.json   # Official hackathon test dataset
└── students_60_test_dataset.csv     # 60-student CSV for local testing
```

---

## 🧪 Test Verification Results

Running `npm test` verifies the engine against all 25 public dataset cases:

```
================================================================
  BOGURA GPA ENGINE - PUBLIC DATASET TEST SUITE (P08)
================================================================

Total Cases Tested:          25
Total Students Evaluated:    1,765
Total Passed Students:       1,240 (70.25%)
Total Failed Students:       525 (29.75%)
Students with Absent Records: 50
Students Receiving 4th Boost: 1,176
Practical Failures Flagged:   260
Theory Failures in Practical: 286
High Average Compulsory Fails: 147

>>> ALL 1,765 STUDENTS IN 25 CASES PASSED 100% AUDIT TESTS! <<<
================================================================
```

---

## 📜 License

This project was built for the **LSH-26 Hackathon** by Team T047. All rights reserved.
