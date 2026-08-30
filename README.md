# Automated GPA Engine — School Result Processing & Transparent Audit System

---

## 🏷️ Metadata

| Field | Value |
|-------|-------|
| **Team ID** | `lsh26-t047` |
| **Problem ID** | `P08` |
| **Problem Title** | School Result Calculation System |
| **Repository** | [github.com/Shaswata28/lsh26-t047-p02](https://github.com/Shaswata28/lsh26-t047-p02) |
| **Live URL** | [lsh26-t047-p08.vercel.app](https://lsh26-t047-p08.vercel.app) |
| **Tech Stack** | Next.js 16.3.3 (Turbopack), React 19, TypeScript, Tailwind CSS v4, Supabase |

---

## 🚀 Live URL

**[https://lsh26-t047-p08.vercel.app](https://lsh26-t047-p08.vercel.app)** *(Deployed via Vercel)*

---

## 👥 Team Contributions

**Shaswata Das**: Project initialization, UI/UX bug resolution, GPA calculation fixes, and management of hackathon submission manifests and deployment routing.

**Warlord112**: Core engine development featuring single/batch CSV data import, live GPA verification, 4th subject swap algorithms, and comprehensive project documentation.

**ProttoyIsOnTop**: Foundational codebase engineering and initial project environment configuration.

**Tanjim**: UI/UX design and refinement, conceptualizing the overarching visual layout, structural aesthetics, and webpage interfaces.

---

## 🛠️ Setup & Run Steps

### Prerequisites
- **Node.js** v18 or later
- **npm** v9 or later
- A **Supabase** project (free tier is fine) with a `students` table

### 1. Clone the Repository
```bash
git clone https://github.com/Shaswata28/lsh26-t047-p02.git
cd lsh26-t047-p02
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
> The Supabase `students` table schema is auto-upserted during operation. No manual SQL migration is needed.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## ✅ Proof That Each Requirement is Met

Based on a thorough review of the implementation (`src/lib/gpaEngine.ts` & UI components), all requested criteria and clarifications are met:

### 1. Create at least 60 students and edge cases
- **Data Volume:** **Met.** The test data in `P08_school_results_public.json` and `students_60_test_dataset.csv` contains 80 and 60 students respectively, across two classes.
- **Subject Constraints (6 Compulsory + 1 Optional):** **Met.** The system accurately enforces 6 compulsory subjects and 1 optional subject per student (`gpaEngine.ts`).
- **Hard Edge Cases:** **Met.** The test dataset explicitly includes students engineered to fall on the defined hard edge cases (failing a compulsory subject despite a high average, practical fail with theory passing, optional subject <= 2.0 GP, absent, etc.).

### 2. Work out each student's result
- **Subject GP & GPA Calculation:** **Met.** `calculateSubjectResult` properly calculates individual Grade Points based on the required scale (A+=5.0 to F=0.0). `calculateStudentResult` computes the total GPA and the overall Letter Grade.

### 3. Show a per-student trace
- **Calculation Trace:** **Met.** `TraceModal.tsx` and the internal `TraceStep` architecture fully trace the calculation. It shows the mark used, the resulting GP, and the rule explanation for every subject.
- **High Average Fail Justification:** **Met.** When a student fails a compulsory subject but achieves a high average, the trace logs a "Compulsory Failure Override Rule" step, overriding the GPA to 0.00 (F) and outputting a `rootCauseFailure` listing the exact subject.

### 4. Give the office a checking list (Audit/Anomaly checking)
- **Checking Lists / Auditing:** **Met.** The application features a dedicated `AnomalyChecker.tsx` and "Hard Edge Filters" in the Student Table to filter students down to the checking list criteria:
  - **Optional list:** Identifies every student whose optional GP is 2.0 or below (including 0.0 / absent).
  - **Practical fail list:** Identifies every student with a practical part below 8 in any subject.
  - **Absent list:** Identifies every student with `AB` in any subject.

### Clarifications Adherence
- **C1. Theory & Practical Pass Marks:** Theory ≥ 25 (out of 75), Practical ≥ 8 (out of 25). Failing either fails the subject (GP 0). **Met** in `gpaEngine.ts`.
- **C2. Absent Logic:** Absent compulsory = GP 0 (F). Absent optional = contributes 0, checking list. **Met**.
- **C3. GPA Formula:** `(sum of compulsory GP + max(0, optional GP - 2)) / 6`, capped at 5.00, shown to 2 decimal places. **Met**.
- **C4. Compulsory Failure Override:** Compulsory failure forces GPA 0.00 (F); uncancelled average stays visible in trace. **Met**.
- **C5. Letter Grade Standard:** Standard boundary mapping (e.g. A+ = 5.00, A = 4.00 to 4.99). **Met**.

---

## 🏗️ Major Design Decisions

### 1. Deterministic Two-Pass GPA Engine
The entire GPA calculation is implemented as a pure, standalone TypeScript function (`src/lib/gpaEngine.ts`). It is completely stateless and deterministic — given the same student data, it always produces the exact same calculation trace.

### 2. Strict Dual-Pass Enforcement
Practical subjects (PHY, CHE, BIO, HMT, AGR) are split into dual models. Failure in either the Theory or Practical component instantly overrides the total-mark grade to **F (GP 0.0)** regardless of total marks. A student with Theory=60, Practical=5 gets GP 0 despite 65/100 total.

### 3. Separation of Validation and Import
The spreadsheet importer performs validation as a completely separate step from database ingestion. The user must explicitly click **"Validate & Check Errors"** before data can be saved, heavily reducing malformed database state.

### 4. Supabase as the Persistence Layer
Student records are stored in a Supabase PostgreSQL table. This enables real-time persistence and fast querying without requiring a heavy, monolithic backend server.

### 5. Automated Anomaly Flagging
Instead of just displaying results, the engine evaluates every student against the edge-case clarifications (Practical fail, Optional boost useless, Absent, High average fail) during the grading pass, automatically generating an `auditFlags` array.

---

## ⚠️ Known Limitations

| Limitation | Notes |
|------------|-------|
| **Excel (.xlsx) format not supported** | CSV/TSV text format is required for batch import. Excel files must be exported as CSV first. |
| **Only Science Curriculum** | The system is built specifically for the Science group curriculum constraints (PHY, CHE, BIO/HMT). Humanities and Commerce groups have different subject structures. |
| **No authentication** | Currently, anyone with the URL can view or modify records. Production usage requires Supabase RLS policies and user authentication. |
| **No one-click PDF export** | The marksheet page is print-ready (CSS `@media print` applied) but does not have a one-click PDF engine built-in. Users must use browser Print → Save as PDF. |

---

## 📁 Repository Structure

```text
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

```text
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
