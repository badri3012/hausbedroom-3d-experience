
/* ============ shared shell wiring (product toggle, page nav, reset, copy) ============ */
let activeProduct = 'pole';

function getActiveApp(){ return activeProduct === 'pole' ? window.PoleApp : window.FlexApp; }

document.querySelectorAll('#productToggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#productToggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeProduct = btn.dataset.product;
    document.getElementById('brandSuffix').textContent = activeProduct === 'pole' ? 'Pole' : 'Flex';
    document.getElementById('poleApp').style.display = activeProduct === 'pole' ? 'flex' : 'none';
    document.getElementById('flexApp').style.display = activeProduct === 'flex' ? 'flex' : 'none';
    document.getElementById('poleAddons').style.display = activeProduct === 'pole' ? 'flex' : 'none';
    document.getElementById('flexAddons').style.display = activeProduct === 'flex' ? 'flex' : 'none';
    getActiveApp().resizeCanvas();
  });
});

document.querySelectorAll('.page-nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.page-nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const page = btn.dataset.page;
    document.getElementById('page-config').style.display = page === 'config' ? 'block' : 'none';
    document.getElementById('page-addons').style.display = page === 'addons' ? 'block' : 'none';
    document.getElementById('page-quote').style.display = page === 'quote' ? 'flex' : 'none';
    if(page === 'config') getActiveApp().resizeCanvas();
    if(page === 'addons' || page === 'quote') getActiveApp().render();
  });
});

function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}
const copyQuoteBtn = document.getElementById('copyQuoteBtn');
copyQuoteBtn.addEventListener('click', ()=>{
  const text = document.getElementById('quotePreview').textContent;
  const done = () => {
    const original = copyQuoteBtn.textContent;
    copyQuoteBtn.textContent = 'Copied!';
    setTimeout(()=>{ copyQuoteBtn.textContent = original; }, 1500);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(()=>{ fallbackCopy(text); done(); });
  } else {
    fallbackCopy(text);
    done();
  }
});

document.getElementById('resetAllBtn').addEventListener('click', ()=>{
  if(confirm('Clear all inputs and start a new quote? This resets every field back to default — current entries will be lost.')){
    window.location.reload();
  }
});

// Initial paint
window.PoleApp.resizeCanvas();
