const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf("const ATS_STOP_WORDS=");
const end = html.indexOf("function setMetric(", start);
assert.ok(start >= 0 && end > start, "ATS scoring implementation must exist");
const { analyze, headingMatches } = vm.runInNewContext(
  html.slice(start, end) + "\n({analyze,headingMatches})",
  {},
  { timeout: 1000 }
);
const base = [
  "Alex Smith", "alex@example.com", "+1 202 555 0111",
  "SUMMARY", "Backend developer", "SKILLS", "Python SQL",
  "WORK EXPERIENCE", "- Built 20 projects for clients",
  "EDUCATION", "Computer Science"
].join("\n");

test("a job description scores only whole-word tokens", () => {
  assert.equal(analyze("JavaScript", "Java").present.length, 0);
  assert.equal(analyze("Python SQL", "Python SQL").keywordScore, 20);
});
test("missing relevant terms lower the job match score", () => {
  const description = "Python SQL Kubernetes Docker AWS Terraform";
  assert.ok(analyze(base, description).score > analyze(base.replace("Python SQL", ""), description).score);
  assert.ok(analyze(base, description).keywordScore < 20);
});
test("no job description excludes and renormalizes keyword score", () => {
  const result = analyze(base, "");
  assert.equal(result.keywordScore, 0);
  assert.equal(result.availablePoints, 80);
  assert.ok(result.score >= 0 && result.score <= 100);
});
test("section detection requires a heading rather than a sentence", () => {
  assert.equal(headingMatches("SKILLS\nPython", /^skills$/i), true);
  assert.equal(headingMatches("I developed skills in Python", /^skills$/i), false);
});
test("dates and contact numbers do not count as business impact", () => {
  const a = analyze("alex@example.com\n+1 202 555 0111\n2024 - 2026", "");
  assert.equal(a.impactScore, 0);
});
test("score is always between 0 and 100", () => {
  for(const text of ["", base, base.repeat(20)]) {
    for(const jd of ["", "Python", "Python SQL Docker Rust AWS React"]) {
      const result = analyze(text, jd);
      assert.ok(result.score >= 0 && result.score <= 100);
    }
  }
});
