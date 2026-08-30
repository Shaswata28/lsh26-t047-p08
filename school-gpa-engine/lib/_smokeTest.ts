// Smoke-test: run all 60 students through the engine and assert the 8 edge cases.
// Run with:  npx ts-node --project tsconfig.json lib/_smokeTest.ts

import { generateMockStudents } from "./seedData";
import { calculateStudentResult } from "./engine";

const students = generateMockStudents();
const results  = students.map(calculateStudentResult);

interface Check {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

const checks: Check[] = [];

function assert(
  id: string,
  label: string,
  condition: boolean,
  detail: string
): void {
  checks.push({ id, label, pass: condition, detail });
}

const r = (idx: number) => results[idx - 1]; // 1-based helper

// EC-1 · Heartbreaker — Math scored 32, must be F
assert("EC-1", "Heartbreaker → letterGrade F",
  r(1).letterGrade === "F",
  `Got: ${r(1).letterGrade}, GPA: ${r(1).finalGPA}`
);

// EC-2 · Practical Trap — Chemistry practical 10 < 8 threshold → F
assert("EC-2", "Practical Trap → letterGrade F",
  r(2).letterGrade === "F",
  `Got: ${r(2).letterGrade}`
);
assert("EC-2b", "Practical Trap → Anomaly B fired",
  r(2).anomalyReasons.some((s) => s.includes("practical failed")),
  `Reasons: ${r(2).anomalyReasons.join(" | ")}`
);

// EC-3 · Neutral Optional — Agriculture 42+33=75 combined → GP 4.0, bonus = 4.0-2.0 = 2.0
// But wait: Agriculture hasPractical=true, so combined = 42+33=75 → GP 4.0
// optionalBonus = 4.0 - 2.0 = 2.0
// Check it doesn't push grade beyond what compulsory warrants
assert("EC-3", "Neutral Optional → passes (not F)",
  r(3).letterGrade !== "F",
  `Got: ${r(3).letterGrade}, GPA: ${r(3).finalGPA}`
);

// EC-4 · Ghost — absent in Math → F, anomaly A fired
assert("EC-4", "Ghost → letterGrade F",
  r(4).letterGrade === "F",
  `Got: ${r(4).letterGrade}`
);
assert("EC-4b", "Ghost → Anomaly A fired",
  r(4).anomalyReasons.some((s) => s.toLowerCase().includes("absent")),
  `Reasons: ${r(4).anomalyReasons.join(" | ")}`
);

// EC-5 · Optional Savior — compulsory barely pass, Higher Math 85 → GP 5.0, bonus 3.0
// finalGPA = (6 × ~1.0 + 3.0) / 6 ≈ 1.5 → D
// Just confirm it passes (not F) and has a grade threshold anomaly
assert("EC-5", "Optional Savior → not F",
  r(5).letterGrade !== "F",
  `Got: ${r(5).letterGrade}, GPA: ${r(5).finalGPA}`
);
assert("EC-5b", "Optional Savior → Anomaly C fired (threshold cross)",
  r(5).isAnomaly && r(5).anomalyReasons.some((s) => s.includes("bonus")),
  `Reasons: ${r(5).anomalyReasons.join(" | ")}`
);

// EC-6 · Optional Fail — optional scored 20, must still pass overall
assert("EC-6", "Optional Fail → not F",
  r(6).letterGrade !== "F",
  `Got: ${r(6).letterGrade}, GPA: ${r(6).finalGPA}`
);

// EC-7 · Double Split Fail — Physics theory 20 + practical 10 → F
assert("EC-7", "Double Split Fail → letterGrade F",
  r(7).letterGrade === "F",
  `Got: ${r(7).letterGrade}`
);

// EC-8 · Perfect Score — all 80+ → A+
assert("EC-8", "Perfect Score → A+",
  r(8).letterGrade === "A+",
  `Got: ${r(8).letterGrade}, GPA: ${r(8).finalGPA}`
);

// ── Print results ─────────────────────────────────────────────────────────────
const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";

console.log("\n═══════════════════════════════════════");
console.log(" School GPA Engine — Edge-Case Smoke Test");
console.log("═══════════════════════════════════════\n");

checks.forEach(({ id, label, pass, detail }) => {
  const icon = pass ? PASS : FAIL;
  console.log(`  ${icon}  [${id}] ${label}`);
  if (!pass) console.log(`       ↳ ${detail}`);
});

const passed = checks.filter((c) => c.pass).length;
const total  = checks.length;
console.log(`\n  ${passed}/${total} checks passed\n`);

if (passed < total) process.exit(1);
