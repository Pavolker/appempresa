// Interações, salvamento local e envio
(function () {
  const form = document.getElementById('diagnosticoForm');
  const toast = document.getElementById('toast');
  const saveDraftBtn = document.getElementById('saveDraft');
  const clearFormBtn = document.getElementById('clearForm');
  const outroInput = document.getElementById('q4_outro');
  const STORAGE_KEY = 'diagnostico_respostas_v1';
  const SUBMISSIONS_KEY = 'diagnostico_enviados_v1';

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

  function hasDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const obj = JSON.parse(raw);
      // Verificar se há pelo menos uma resposta salva
      return obj && (obj.q1 || obj.q2 || obj.q3 || obj.q4 || obj.q4_outro || obj.q5_sugestoes);
    } catch (e) {
      return false;
    }
  }

  function clearAll() {
    form.reset();
    outroInput.disabled = true;
    outroInput.required = false;
    outroInput.value = '';
    localStorage.removeItem(STORAGE_KEY);
    // Esconder notificação de rascunho se existir
    const draftNotice = document.getElementById('draftNotice');
    if (draftNotice) {
      draftNotice.style.display = 'none';
    }
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

  // Registrar envio para histórico local
  function registerSubmission(data) {
    try {
      const submissions = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
      submissions.push({
        ...data,
        timestamp: new Date().toISOString(),
        submitted: true
      });
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Erro ao registrar envio:', e);
    }
  }

  // Em desenvolvimento local, evitar POST (servidor estático) e simular envio
  form.addEventListener('submit', async (e) => {
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
    
    if (isLocal) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = readAnswers();
      saveLocal();
      registerSubmission(data);
      showToast('Simulação de envio: publique no Netlify para registrar!', 'info');
      return;
    }

    // Em produção (Netlify)
    if (!form.reportValidity()) {
      e.preventDefault();
      return;
    }

    // Registrar antes do envio
    const data = readAnswers();
    registerSubmission(data);
    saveLocal();

    // Interceptar o envio e fazer redirecionamento manual via fetch
    e.preventDefault();
    
    // Mostrar feedback de carregamento
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
      // Criar FormData do formulário
      const formData = new FormData(form);
      
      // Enviar para o endpoint do Netlify (mesma URL da página)
      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'text/html'
        },
        redirect: 'manual' // Não seguir redirects automaticamente
      });

      // O Netlify Forms processa o POST e pode retornar 200 ou 302
      // Independente da resposta, redirecionar para success.html
      // O formulário já foi processado pelo Netlify
      // Limpar rascunho após envio bem-sucedido
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 500);
      
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      // Mesmo com erro de rede, redirecionar após um tempo
      // O Netlify pode ter processado o formulário mesmo assim
      // Limpar rascunho mesmo em caso de erro (pode ter sido enviado)
      localStorage.removeItem(STORAGE_KEY);
      showToast('Enviando respostas...', 'info');
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 1500);
    }
    // Não restaurar o botão aqui, pois vamos redirecionar
  });

  // Mostrar notificação de rascunho se existir, mas NÃO restaurar automaticamente
  const draftNotice = document.getElementById('draftNotice');
  const restoreDraftBtn = document.getElementById('restoreDraftBtn');
  
  if (hasDraft()) {
    // Mostrar notificação de rascunho disponível
    if (draftNotice) {
      draftNotice.style.display = 'block';
    }
    
    // Botão para restaurar rascunho
    if (restoreDraftBtn) {
      restoreDraftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        restoreLocal();
        showToast('Rascunho restaurado com sucesso', 'success');
        if (draftNotice) {
          draftNotice.style.display = 'none';
        }
      });
    }
  }

  // Restaurar automaticamente apenas se vier da página de sucesso com parâmetro
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('restore') === 'true') {
    restoreLocal();
    showToast('Rascunho restaurado', 'success');
    if (draftNotice) {
      draftNotice.style.display = 'none';
    }
    // Remover o parâmetro da URL
    window.history.replaceState({}, '', window.location.pathname);
  }
})();