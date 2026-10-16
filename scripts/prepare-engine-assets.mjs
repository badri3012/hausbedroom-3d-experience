import fs from "fs";

// 1. Copy reference styles
const css = fs.readFileSync("scripts/reference_styles.css", "utf8");
fs.writeFileSync("public/engine/reference_styles.css", css);
console.log("Written public/engine/reference_styles.css");

// 2. Prepare PoleApp with 3D tab support & state notification
let s0 = fs.readFileSync("scripts/reference_script_0.js", "utf8");

// Hook 3D tab for Pole Straight
s0 = s0.replace(
  "topCanvas.style.display = view==='top' ? 'block' : 'none';",
  `topCanvas.style.display = view==='top' ? 'block' : 'none';
    const threeD = document.getElementById('threeDViewContainer');
    if (threeD) threeD.style.display = view==='3d' ? 'block' : 'none';`
);

// Hook 3D tab for Pole L-Shape
s0 = s0.replace(
  "lsCanvas.style.display = view==='top' ? 'block' : 'none';",
  `lsCanvas.style.display = view==='top' ? 'block' : 'none';
    const threeDLS = document.getElementById('threeDViewContainerLS');
    if (threeDLS) threeDLS.style.display = view==='3d' ? 'block' : 'none';`
);

// Hook state notification inside renderInner of PoleApp
s0 = s0.replace(
  "renderQuotePage(s, d, internal, p, ap, ls);",
  `renderQuotePage(s, d, internal, p, ap, ls);
  if (typeof window !== 'undefined' && window.onHausBedroomStateUpdate) {
    try {
      window.onHausBedroomStateUpdate({
        product: 'pole',
        state: JSON.parse(JSON.stringify(state)),
        straightDesign: d,
        lshapeDesign: ls,
        price: p,
        addonsPrice: ap
      });
    } catch(err) { console.error('State notify err:', err); }
  }`
);

fs.writeFileSync("public/engine/poleApp.js", s0);
console.log("Written public/engine/poleApp.js");

// 3. Prepare FlexApp with 3D tab support & state notification
let s1 = fs.readFileSync("scripts/reference_script_1.js", "utf8");

// Hook 3D tab for Flex Straight
s1 = s1.replace(
  "topCanvas.style.display = view==='top'?'block':'none';",
  `topCanvas.style.display = view==='top'?'block':'none';
    const flex3D = document.getElementById('flexThreeDViewContainer');
    if (flex3D) flex3D.style.display = view==='3d' ? 'block' : 'none';`
);

// Hook 3D tab for Flex L-Shape
s1 = s1.replace(
  "document.querySelectorAll('.flex-ls-tab-btn').forEach(btn=>{",
  `document.querySelectorAll('.flex-ls-tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const view = btn.dataset.lsview;
    const flexLs3D = document.getElementById('flexLsThreeDViewContainer');
    if (flexLs3D) flexLs3D.style.display = view==='3d' ? 'block' : 'none';
  });`
);

// Hook state notification inside renderInner of FlexApp
s1 = s1.replace(
  "renderQuoteStraight(d);",
  `renderQuoteStraight(d);
  if (typeof window !== 'undefined' && window.onHausBedroomStateUpdate) {
    try {
      window.onHausBedroomStateUpdate({
        product: 'flex',
        state: JSON.parse(JSON.stringify(state)),
        flexStraightDesign: d
      });
    } catch(err) { console.error('Flex state notify err:', err); }
  }`
);

s1 = s1.replace(
  "renderQuoteLShape(lsd);",
  `renderQuoteLShape(lsd);
  if (typeof window !== 'undefined' && window.onHausBedroomStateUpdate) {
    try {
      window.onHausBedroomStateUpdate({
        product: 'flex',
        state: JSON.parse(JSON.stringify(state)),
        flexLshapeDesign: lsd
      });
    } catch(err) { console.error('Flex LS state notify err:', err); }
  }`
);

fs.writeFileSync("public/engine/flexApp.js", s1);
console.log("Written public/engine/flexApp.js");

// 4. Prepare shellApp.js
const s2 = fs.readFileSync("scripts/reference_script_2.js", "utf8");
fs.writeFileSync("public/engine/shellApp.js", s2);
console.log("Written public/engine/shellApp.js");

// 5. Prepare reference body HTML with 3D tabs and 3D containers
let body = fs.readFileSync("scripts/reference_body.html", "utf8");

// Add 3D Showroom tab to Pole Straight tabs
body = body.replace(
  '<button class="tab-btn pole-tab-btn" data-view="top">Top View</button>\n    </div>\n    <div class="view-panel">\n      <canvas id="elevCanvas"></canvas>\n      <canvas id="internalElevCanvas" style="display:none;"></canvas>\n      <canvas id="topViewCanvas" style="display:none;"></canvas>',
  `<button class="tab-btn pole-tab-btn" data-view="top">Top View</button>
      <button class="tab-btn pole-tab-btn" data-view="3d" style="background:#262B34; color:#D8A574; font-weight:600;">✦ 3D Showroom</button>
    </div>
    <div class="view-panel">
      <canvas id="elevCanvas"></canvas>
      <canvas id="internalElevCanvas" style="display:none;"></canvas>
      <canvas id="topViewCanvas" style="display:none;"></canvas>
      <div id="threeDViewContainer" style="display:none; width:100%; height:480px; position:relative; background:#181816;"></div>`
);

// Add 3D Showroom tab to Pole L-Shape tabs
body = body.replace(
  '<button class="tab-btn ls-tab-btn pole-ls-tab-btn" data-lsview="top">Top View</button>\n      </div>\n      <div class="view-panel">\n        <canvas id="lshapeExtCanvas" style="display:block; width:100%; height:480px;"></canvas>\n        <canvas id="lshapeIntCanvas" style="display:none; width:100%; height:480px;"></canvas>\n        <canvas id="lshapeTopViewCanvas" style="display:none; width:100%; height:480px;"></canvas>',
  `<button class="tab-btn ls-tab-btn pole-ls-tab-btn" data-lsview="top">Top View</button>
        <button class="tab-btn ls-tab-btn pole-ls-tab-btn" data-lsview="3d" style="background:#262B34; color:#D8A574; font-weight:600;">✦ 3D Showroom</button>
      </div>
      <div class="view-panel">
        <canvas id="lshapeExtCanvas" style="display:block; width:100%; height:480px;"></canvas>
        <canvas id="lshapeIntCanvas" style="display:none; width:100%; height:480px;"></canvas>
        <canvas id="lshapeTopViewCanvas" style="display:none; width:100%; height:480px;"></canvas>
        <div id="threeDViewContainerLS" style="display:none; width:100%; height:480px; position:relative; background:#181816;"></div>`
);

// Add 3D Showroom tab to Flex Straight tabs
body = body.replace(
  '<button class="tab-btn flex-tab-btn" data-view="top">Top View</button>\n      </div>\n      <div class="view-panel">\n        <canvas id="flexElevCanvas"></canvas>\n        <canvas id="flexInternalElevCanvas" style="display:none;"></canvas>\n        <canvas id="flexTopViewCanvas" style="display:none;"></canvas>',
  `<button class="tab-btn flex-tab-btn" data-view="top">Top View</button>
        <button class="tab-btn flex-tab-btn" data-view="3d" style="background:#262B34; color:#D8A574; font-weight:600;">✦ 3D Showroom</button>
      </div>
      <div class="view-panel">
        <canvas id="flexElevCanvas"></canvas>
        <canvas id="flexInternalElevCanvas" style="display:none;"></canvas>
        <canvas id="flexTopViewCanvas" style="display:none;"></canvas>
        <div id="flexThreeDViewContainer" style="display:none; width:100%; height:480px; position:relative; background:#181816;"></div>`
);

// Add 3D Showroom tab to Flex L-Shape tabs
body = body.replace(
  '<button class="tab-btn flex-ls-tab-btn" data-lsview="top">Top View</button>\n      </div>\n      <div class="view-panel">\n        <canvas id="flexLsExtCanvas" style="display:block; width:100%; height:480px;"></canvas>\n        <canvas id="flexLsIntCanvas" style="display:none; width:100%; height:480px;"></canvas>\n        <canvas id="flexLsTopCanvas" style="display:none; width:100%; height:420px;"></canvas>',
  `<button class="tab-btn flex-ls-tab-btn" data-lsview="top">Top View</button>
        <button class="tab-btn flex-ls-tab-btn" data-lsview="3d" style="background:#262B34; color:#D8A574; font-weight:600;">✦ 3D Showroom</button>
      </div>
      <div class="view-panel">
        <canvas id="flexLsExtCanvas" style="display:block; width:100%; height:480px;"></canvas>
        <canvas id="flexLsIntCanvas" style="display:none; width:100%; height:480px;"></canvas>
        <canvas id="flexLsTopCanvas" style="display:none; width:100%; height:420px;"></canvas>
        <div id="flexLsThreeDViewContainer" style="display:none; width:100%; height:480px; position:relative; background:#181816;"></div>`
);

// Export as a TS module
const tsContent = `// Auto-generated exact reference HTML from HausBedroom_Configurator_3.html
export const REFERENCE_BODY_HTML = ${JSON.stringify(body)};
`;

fs.writeFileSync("src/components/configurator/engineering-html.ts", tsContent);
console.log("Written src/components/configurator/engineering-html.ts");
