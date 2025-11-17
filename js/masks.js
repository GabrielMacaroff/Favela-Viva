/* masks.js
   API público:
   - applyInputMasks()
   - validateForm(event)
*/

function setCursorPosition(pos, elem){
  try{ elem.setSelectionRange(pos, pos); }catch(e){}
}

function maskCPF(value){
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function maskCEP(value){
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0,9);
}

function maskPhone(value){
  const v = value.replace(/\D/g,'');
  if(v.length <= 10){
    return v
      .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      .replace(/-$/, '');
  }
  return v
    .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    .replace(/-$/, '');
}

function applyMaskOnInput(selector, maskFn){
  const el = document.querySelector(selector);
  if(!el) return;
  el.addEventListener('input', function(e){
    const start = e.target.selectionStart;
    const oldLen = e.target.value.length;
    e.target.value = maskFn(e.target.value);
    const newLen = e.target.value.length;
    const diff = newLen - oldLen;
    setTimeout(()=>{ try{ e.target.selectionStart = start + diff; e.target.selectionEnd = start + diff;} catch(e){} },0);
  });
}

function showFormError(msg){
  const el = document.getElementById('formErrors');
  if(!el) return;
  el.textContent = msg;
  el.style.color = '#b91c1c';
}

function clearFormError(){
  const el = document.getElementById('formErrors');
  if(!el) return;
  el.textContent = '';
}

/* helper to partially mask CPF on confirmation */
function maskRevealPartialCPF(cpf){
  if(!cpf) return '';
  const cleaned = cpf.replace(/\D/g,'');
  if(cleaned.length !== 11) return '***.***.***-**';
  return '***.***.***-' + cleaned.slice(-2);
}

function escapeHtml(unsafe){
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* set max date for nascimento field (run on DOMContentLoaded) */
function setMaxNascimento(){
  const el = document.getElementById('nascimento');
  if(!el) return;
  const today = new Date();
  const iso = today.toISOString().split('T')[0];
  el.setAttribute('max', iso);
}

/* close nav when clicking outside */
function setupOutsideNavClose(toggleId, navId){
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if(!toggle || !nav) return;
  document.addEventListener('click', (e)=>{
    if(!nav.contains(e.target) && !toggle.contains(e.target)){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

/* accessible toast helper */
function showToast(message, ms = 3500){
  let container = document.querySelector('.toast-container');
  if(!container){
    container = document.createElement('div'); container.className = 'toast-container'; container.setAttribute('aria-live','polite'); document.body.appendChild(container);
  }
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = message;
  container.appendChild(t);
  setTimeout(()=> t.remove(), ms);
}

/* validation and submit handling */
function validateForm(event){
  event.preventDefault();
  clearFormError();
  const form = event.target || document.getElementById('cadastroForm');
  if(!form) return;

  // built-in validity
  if(!form.checkValidity()){
    showFormError('Existem campos inválidos. Verifique e tente novamente.');
    const firstInvalid = form.querySelector(':invalid');
    if(firstInvalid) firstInvalid.focus();
    return false;
  }

  // collect data (but do not send anywhere)
  const data = new FormData(form);
  const summary = {
    nome: data.get('nome') || '',
    email: data.get('email') || '',
    cpf: maskRevealPartialCPF(data.get('cpf') || ''),
    telefone: data.get('telefone') || '',
    perfil: data.get('perfil') || 'voluntario'
  };

  // show confirmation
  const successEl = document.getElementById('formSuccess');
  if(successEl){
    successEl.innerHTML = `<strong>Cadastro simulado com sucesso!</strong>
      <p>Obrigado, ${escapeHtml(summary.nome)}. Enviaremos confirmação para: <span class="muted">${escapeHtml(summary.email)}</span></p>
      <p>CPF (parcial): <span class="muted">${escapeHtml(summary.cpf)}</span></p>
      <p>Perfil: <span class="muted">${escapeHtml(summary.perfil)}</span></p>`;
    form.reset();
    successEl.scrollIntoView({behavior:'smooth'});
    showToast('Cadastro enviado (simulado) — obrigado!');
  }

  return true;
}

/* apply masks and wire UI */
function applyInputMasks(){
  // masks
  applyMaskOnInput('#cpf', maskCPF);
  applyMaskOnInput('#cep', maskCEP);
  applyMaskOnInput('#telefone', maskPhone);

  // form submit binding
  const form = document.getElementById('cadastroForm');
  if(form){
    form.addEventListener('submit', validateForm);
    form.addEventListener('invalid', function(e){
      e.preventDefault();
      const field = e.target;
      showFormError('Por favor, corrija os campos destacados.');
      try{ field.focus(); }catch(e){}
    }, true);
  }

  // mobile nav toggles
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if(navToggle && nav){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }
  const navToggle2 = document.getElementById('navToggle2');
  const nav2 = document.getElementById('mainNav2');
  if(navToggle2 && nav2){
    navToggle2.addEventListener('click', ()=>{
      const expanded = navToggle2.getAttribute('aria-expanded') === 'true';
      navToggle2.setAttribute('aria-expanded', String(!expanded));
      nav2.classList.toggle('open');
    });
  }

  // dropdown toggles (for any .dropdown-toggle)
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    const root = toggle.closest('.dropdown');
    toggle.addEventListener('click', (e)=>{
      e.preventDefault();
      const isOpen = root.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/* ---------------------------
  Carousel (hero) behavior
  --------------------------- */
(function(){
  const INTERVAL = 4000; // 4s
  let current = 0;
  let slides = [];
  let indicators = [];
  let timer = null;
  let playing = true;

  function showSlide(index){
    index = (index + slides.length) % slides.length;
    slides.forEach((s,i)=>{
      const visible = i === index;
      s.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });
    indicators.forEach((btn,i)=>{
      btn.setAttribute('aria-selected', String(i === index));
    });
    current = index;
  }

  function nextSlide(){ showSlide(current + 1); }
  function prevSlide(){ showSlide(current - 1); }

  function startAuto(){
    stopAuto();
    timer = setInterval(nextSlide, INTERVAL);
    playing = true;
  }
  function stopAuto(){
    if(timer){ clearInterval(timer); timer = null; }
    playing = false;
  }

  function initCarousel(){
    const track = document.getElementById('carouselTrack');
    if(!track) return;
    slides = Array.from(track.querySelectorAll('.carousel-slide'));
    indicators = Array.from(document.querySelectorAll('.carousel-indicators .indicator'));

    // if no indicators, create them
    if(indicators.length !== slides.length){
      const container = document.getElementById('carouselIndicators');
      container.innerHTML = '';
      slides.forEach((s,i)=>{
        const btn = document.createElement('button');
        btn.className = 'indicator';
        btn.setAttribute('data-slide-to', String(i));
        btn.setAttribute('aria-controls', 'carouselTrack');
        btn.setAttribute('aria-selected', i===0 ? 'true' : 'false');
        btn.title = 'Slide ' + (i+1);
        container.appendChild(btn);
      });
      indicators = Array.from(container.querySelectorAll('.indicator'));
    }

    // initial state
    showSlide(0);

    // wire indicators
    indicators.forEach((btn, i)=>{
      btn.addEventListener('click', ()=>{ showSlide(i); stopAuto(); });
      btn.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); showSlide(i); stopAuto(); }
      });
    });

    // controls
    const prev = document.getElementById('carouselPrev');
    const next = document.getElementById('carouselNext');
    if(prev) prev.addEventListener('click', ()=>{ prevSlide(); stopAuto(); });
    if(next) next.addEventListener('click', ()=>{ nextSlide(); stopAuto(); });

    // pause on hover/focus
    track.addEventListener('mouseenter', ()=> stopAuto());
    track.addEventListener('mouseleave', ()=> startAuto());
    track.addEventListener('focusin', ()=> stopAuto());
    track.addEventListener('focusout', ()=> startAuto());

    // keyboard navigation (left/right)
    track.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft'){ prevSlide(); stopAuto(); }
      if(e.key === 'ArrowRight'){ nextSlide(); stopAuto(); }
    });

    // start autoplay
    startAuto();
  }

  // init after DOM
  if (typeof window !== 'undefined'){
    window.addEventListener('DOMContentLoaded', initCarousel);
  }
})();
