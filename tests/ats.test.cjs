const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("public/index.html", "utf8");
const start = html.indexOf("const ATS_STOP_WORDS=");
const end = html.indexOf("function setMetric(", start);
assert.ok(start >= 0 && end > start, "ATS scoring implementation must exist");
const { analyze, headingMatches, compareAtsResults } = vm.runInNewContext(
  html.slice(start, end) + "\n({analyze,headingMatches,compareAtsResults})",
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

test("AI comparison uses the same job description for both versions", () => {
  const before = base.replace("Python SQL", "Python");
  const after = base;
  const comparison = compareAtsResults(before, after, "Python SQL Docker");
  assert.equal(comparison.before.score, analyze(before, "Python SQL Docker").score);
  assert.equal(comparison.after.score, analyze(after, "Python SQL Docker").score);
  assert.equal(comparison.delta, comparison.after.score - comparison.before.score);
  assert.ok(comparison.metrics.some(m => m.label === "Keyword relevance"));
});
test("no-job AI polish comparison excludes the keyword metric", () => {
  const comparison = compareAtsResults(base, base + "\n- Improved 15% throughput", "");
  assert.equal(comparison.metrics.some(m => m.label === "Keyword relevance"), false);
  assert.equal(comparison.before.availablePoints, 80);
  assert.equal(comparison.after.availablePoints, 80);
});
test("AI output can score lower or remain unchanged", () => {
  const equal = compareAtsResults(base, base, "");
  assert.equal(equal.delta, 0);
  const worse = compareAtsResults(base, "Name only", "");
  assert.ok(worse.delta < 0);
});

test("AI review presents updated score in main scorecard", () => {
  assert.match(html, /id="score-after-ai-summary"/);
  assert.match(html, /function showReviewScoreSummary\(comparison\)/);
  assert.match(html, /showChecklistScore\(comparison\.after,true\)/);
  assert.match(html, /showReviewScoreSummary\(comparison\)/);
});
