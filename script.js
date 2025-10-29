// Interações, salvamento local e envio
(function () {
  const form = document.getElementById('diagnosticoForm');
  const toast = document.getElementById('toast');
  const saveDraftBtn = document.getElementById('saveDraft');
  const clearFormBtn = document.getElementById('clearForm');
  const outroInput = document.getElementById('q4_outro');
  const STORAGE_KEY = 'diagnostico_respostas_v1';

  function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.style.borderColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--border)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function readAnswers() {
    const data = new FormData(form);
    const obj = {};
    for (const [k, v] of data.entries()) {
      if (k !== 'form-name' && k !== 'bot-field') {
        obj[k] = v;
      }
    }
    return obj;
  }

  function saveLocal() {
    const obj = readAnswers();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      showToast('Rascunho salvo no dispositivo', 'success');
    } catch (e) {
      showToast('Falha ao salvar localmente', 'error');
    }
  }

  function restoreLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      ['q1','q2','q3','q4'].forEach((key) => {
        if (obj[key]) {
          const input = form.querySelector(`input[name="${key}"][value="${obj[key]}"]`);
          if (input) input.checked = true;
        }
      });
      if (obj.q4 === 'Outro') {
        outroInput.disabled = false;
        outroInput.required = true;
      }
      if (obj.q4_outro) outroInput.value = obj.q4_outro;
      // Restaurar sugestões (texto livre)
      if (obj.q5_sugestoes) {
        const ta = form.querySelector('#q5_sugestoes');
        if (ta) ta.value = obj.q5_sugestoes;
      }
    } catch (e) {}
  }

  function clearAll() {
    form.reset();
    outroInput.disabled = true;
    outroInput.required = false;
    outroInput.value = '';
    localStorage.removeItem(STORAGE_KEY);
    showToast('Formulário limpo', 'success');
  }

  // Toggle "Outro" input
  form.addEventListener('change', (ev) => {
    if (ev.target && ev.target.name === 'q4') {
      const isOutro = ev.target.value === 'Outro';
      outroInput.disabled = !isOutro;
      outroInput.required = isOutro;
      if (!isOutro) outroInput.value = '';
    }
  });

  // Autosave on change (leve)
  form.addEventListener('input', () => {
    // Throttle via requestAnimationFrame
    window.requestAnimationFrame(saveLocal);
  });

  saveDraftBtn.addEventListener('click', (e) => {
    e.preventDefault();
    saveLocal();
  });

  clearFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearAll();
  });

  // Em desenvolvimento local, evitar POST (servidor estático) e simular envio
  form.addEventListener('submit', (e) => {
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (isLocal) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      saveLocal();
      showToast('Simulação de envio: publique no Netlify para registrar!', 'info');
    } else {
      // Em produção (Netlify), envio normal para Forms
      saveLocal();
    }
  });

  restoreLocal();
})();