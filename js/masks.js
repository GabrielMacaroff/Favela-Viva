/* masks.js
   API público:
   - applyInputMasks()
   - validateForm(event)
*/

function setCursorPosition(pos, elem){
  elem.setSelectionRange(pos, pos);
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
      field.focus();
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

function maskRevealPartialCPF(cpf){
  if(!cpf) return '';
  const cleaned = cpf.replace(/\D/g,'');
  if(cleaned.length !== 11) return '***.***.***-**';
  return '***.***.***-' + cleaned.slice(-2);
}

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
  }

  return true;
}

function escapeHtml(unsafe){
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// auto-apply when o script carrega
if (typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', applyInputMasks);
}

// export for modules (optional)
if(typeof module !== 'undefined'){
  module.exports = { applyInputMasks, validateForm };
}
