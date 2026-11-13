const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadGuard(file) {
  const code=fs.readFileSync(file,"utf8");
  const start=code.indexOf("function resumeFactWarnings(");
  const end=code.indexOf("function buildPrompt(",start);
  assert.ok(start>=0 && end>start, file+" must include the factual guard");
  return vm.runInNewContext(
    'const cleanText = value => String(value || "").replace(/\r\n/g, "\n").trim();\n'+
    code.slice(start,end)+'\nresumeFactWarnings',
    {},
    {timeout:1000}
  );
}
for (const file of ["functions/api/ai.js","netlify/functions/ai.js"]) {
  const check=loadGuard(file);
  test(file+": rejects dropped (Example) employer qualifier", () => {
    const input="Data Intern | Northstar Retail (Example) | Jun 2025 - Aug 2025";
    const output="Data Intern | Northstar Retail | Jun 2025 - Aug 2025";
    assert.ok(check(input,output).some(v=>v.includes("qualifier")));
  });
  test(file+": rejects an unsupported year or metric", () => {
    const input="Improved customer workflows in 2025.";
    const output="Improved customer workflows by 75% in 2026.";
    const warnings=check(input,output);
    assert.ok(warnings.some(v=>v.includes("year")));
    assert.ok(warnings.some(v=>v.includes("numerical")));
  });
  test(file+": rejects a changed email and a removed link", () => {
    const input="sam@example.com | github.com/sam/repo";
    const output="sam@other.com";
    assert.ok(check(input,output).length>=2);
  });
  test(file+": accepts valid wording improvements and preserved facts", () => {
    const input="sam@example.com\nData Intern | Northstar Retail (Example) | 2025\n- Created report";
    const output="sam@example.com\nData Intern | Northstar Retail (Example) | 2025\n- Created a recurring report";
    assert.equal(check(input,output).length,0);
  });
}
