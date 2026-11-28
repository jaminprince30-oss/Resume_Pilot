const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("public/index.html", "utf8");

test("photo inputs are optional, separate and excluded from AI requests", () => {
  assert.match(html, /id="builder-photo-file" type="file" accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /id="checker-photo-file" type="file" accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /builderPhoto:"",checkerPhoto:""/);
  assert.match(html, /JSON\.stringify\(\{mode,resumeText,jobDescription\}\)/);
  assert.match(html, /state\.builderPhoto\);/);
  assert.match(html, /state\.checkerPhoto\);/);
});

test("exporters add photos only when requested", async () => {
  const start=html.indexOf("async function exportPdf(");
  const end=html.indexOf("async function downloadResume(",start);
  const calls=[];let files={};
  class FakePdf {
    constructor(){this.internal={pageSize:{getWidth:()=>612,getHeight:()=>792}}}
    addImage(...args){calls.push(["image",...args])}
    setFont(){} setFontSize(){} text(){} setDrawColor(){} setLineWidth(){} line(){} addPage(){} save(){}
    splitTextToSize(t,w){calls.push(["width",w]);return [t]}
  }
  class FakeZip {
    constructor(){files={}}
    file(n,data,options){files[n]={data,options}}
    async generateAsync(){return {}}
  }
  const window={jspdf:{jsPDF:FakePdf},JSZip:FakeZip};
  const document={createElement:()=>({click(){}})};
  const URL={createObjectURL:()=> "blob:test",revokeObjectURL(){}};
  const api=new Function("window","document","URL","setTimeout","loadScript","exportStructure","cleanResumeForExport","pdfSafe",html.slice(start,end)+"return {exportPdf,exportDocx};")(window,document,URL,f=>f(),async()=>{},()=>[{kind:"title",text:"Candidate"},{kind:"text",text:"Email"},{kind:"heading",text:"Skills"},{kind:"text",text:"Python"}],x=>x,x=>x);
  const photo="data:image/jpeg;base64,AA==";
  await api.exportPdf("a.pdf","test",photo);
  assert.equal(calls.filter(c=>c[0]==="image").length,1);
  assert.ok(calls.some(c=>c[0]==="width"&&c[1]===420));
  assert.ok(calls.some(c=>c[0]==="width"&&c[1]===504));
  calls.length=0;
  await api.exportPdf("b.pdf","test");
  assert.equal(calls.some(c=>c[0]==="image"),false);
  await api.exportDocx("a.docx","test",photo);
  assert.ok(files["word/media/profile.jpg"]);
  assert.match(files["word/_rels/document.xml.rels"].data,/rIdPhoto/);
  assert.match(files["word/document.xml"].data,/r:embed="rIdPhoto"/);
  await api.exportDocx("b.docx","test");
  assert.equal(files["word/media/profile.jpg"],undefined);
  assert.doesNotMatch(files["word/document.xml"].data,/r:embed="rIdPhoto"/);
});
