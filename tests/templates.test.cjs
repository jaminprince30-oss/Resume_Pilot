const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html=fs.readFileSync("public/index.html","utf8");
function fixture(){
  const nodes={};
  const get=id=>nodes[id]||(nodes[id]={value:"",innerHTML:"",placeholder:"",classList:{toggle(){},add(){}},addEventListener(){}});
  const state={templateId:"",targetTitle:"Previous title",fullName:"Real Person",skills:"My skills",summary:"My summary",builderPhoto:"photo",builderOptimizedText:"old",experience:[{role:"Real role"}]};
  const flow={page:"",confirm:false};
  const start=html.indexOf("const RESUME_TEMPLATES=");
  const end=html.indexOf("function entryTemplate(",start);
  assert.ok(start>=0&&end>start);
  const api=new Function("state","$","document","window","esc","renderPreview","setPage","toast",html.slice(start,end)+"return {RESUME_TEMPLATES,filterTemplates,applyTemplate,renderTemplates};")(state,get,{querySelectorAll:()=>[]},{confirm:()=>flow.confirm},String,()=>{},p=>flow.page=p,()=>{});
  return {api,state,flow,get};
}
test("catalog includes unique roles and filters by keyword and industry",()=>{
  const {api}=fixture();
  assert.equal(api.RESUME_TEMPLATES.length,36);
  assert.equal(new Set(api.RESUME_TEMPLATES.map(t=>t.id)).size,36);
  assert.ok(api.filterTemplates("python","Technology").length>=1);
  assert.equal(api.filterTemplates("nurse","Healthcare").length,1);
  assert.equal(api.filterTemplates("not-a-role").length,0);
});
test("choosing a role preserves candidate facts and photo",()=>{
  const {api,state,flow}=fixture();
  api.applyTemplate("role-6");
  assert.equal(state.targetTitle,"Previous title");
  flow.confirm=true;
  api.applyTemplate("role-6");
  assert.equal(state.targetTitle,"Data Analyst");
  assert.equal(state.fullName,"Real Person");
  assert.equal(state.skills,"My skills");
  assert.equal(state.summary,"My summary");
  assert.equal(state.experience[0].role,"Real role");
  assert.equal(state.builderPhoto,"photo");
  assert.equal(state.builderOptimizedText,"");
  assert.equal(flow.page,"builder");
});
test("template results follow selected filters",()=>{
  const {api,get}=fixture();
  get("template-search").value="nurse";
  get("template-category").value="Healthcare";
  api.renderTemplates();
  assert.match(get("template-grid").innerHTML,/Nurse/);
  assert.doesNotMatch(get("template-grid").innerHTML,/Pharmacist/);
});
