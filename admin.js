// Administração e visualização de respostas
(function () {
  const STORAGE_KEY = 'diagnostico_respostas_v1';
  const SUBMISSIONS_KEY = 'diagnostico_enviados_v1';
  const toast = document.getElementById('toast');
  const responsesContainer = document.getElementById('responsesContainer');
  const totalRascunhosEl = document.getElementById('totalRascunhos');
  const totalEnviadosEl = document.getElementById('totalEnviados');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  const clearLocalBtn = document.getElementById('clearLocalBtn');

  function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.style.borderColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--border)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function formatDate(date) {
    if (!date) return 'Data não disponível';
    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getAllLocalStorageData() {
    const responses = [];
    
    // Buscar rascunhos (não enviados)
    try {
      const draftData = localStorage.getItem(STORAGE_KEY);
      if (draftData) {
        const parsed = JSON.parse(draftData);
        if (parsed && typeof parsed === 'object' && !parsed.submitted) {
          responses.push({
            key: STORAGE_KEY,
            data: parsed,
            timestamp: parsed.timestamp || new Date().toISOString(),
            submitted: false
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao ler rascunho:', e);
    }
    
    // Buscar todas as outras chaves relacionadas ao diagnóstico
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('diagnostico_') && key !== STORAGE_KEY && key !== SUBMISSIONS_KEY) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed && typeof parsed === 'object') {
              responses.push({
                key: key,
                data: parsed,
                timestamp: parsed.timestamp || parsed.date || new Date().toISOString(),
                submitted: parsed.submitted || false
              });
            }
          }
        } catch (e) {
          console.warn('Erro ao ler chave:', key, e);
        }
      }
    }

    return responses;
  }

  function renderResponses() {
    // Carregar respostas enviadas primeiro
    loadSubmittedResponses();
    
    // Se não houver respostas enviadas, mostrar apenas rascunhos
    const rascunhos = getAllLocalStorageData();
    const enviados = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    const total = rascunhos.length + enviados.length;
    
    if (total === 0) {
      responsesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>Nenhum rascunho local encontrado.</p>
          <p style="font-size: 12px; margin-top: 8px;">Os rascunhos são salvos apenas no dispositivo do usuário.</p>
          <p style="font-size: 12px; margin-top: 8px; font-weight: 600;">
            ⚠️ Para ver todas as respostas enviadas, acesse o painel do Netlify Forms.
          </p>
        </div>
      `;
      totalRascunhosEl.textContent = '0';
      return;
    }
    
    // Se já renderizou combinado, não precisa renderizar de novo
    if (enviados.length > 0) {
      return; // Já foi renderizado em loadSubmittedResponses
    }
    
    // Renderizar apenas rascunhos
    totalRascunhosEl.textContent = rascunhos.length;
    renderCombinedResponses(rascunhos);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function exportToJSON() {
    const rascunhos = getAllLocalStorageData();
    const enviados = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
    const allResponses = [...enviados.map(e => ({ ...e, source: 'enviado' })), ...rascunhos.map(r => ({ ...r.data, source: 'rascunho', timestamp: r.timestamp }))];
    
    if (allResponses.length === 0) {
      showToast('Nenhuma resposta para exportar', 'error');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      totalRascunhos: rascunhos.length,
      totalEnviados: enviados.length,
      total: allResponses.length,
      nota: 'Respostas enviadas estão disponíveis no Netlify Forms. Este arquivo contém apenas dados locais.',
      responses: allResponses
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico_respostas_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Exportados ${allResponses.length} registro(s)!`, 'success');
  }

  function clearLocalDrafts() {
    if (!confirm('Tem certeza que deseja limpar todos os rascunhos locais?\n\nIsso não afetará as respostas já enviadas ao Netlify.')) {
      return;
    }

    try {
      // Limpar apenas rascunhos, não submissões registradas
      localStorage.removeItem(STORAGE_KEY);
      
      // Limpar outras chaves relacionadas
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('diagnostico_respostas')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      renderResponses();
      showToast('Rascunhos locais removidos', 'success');
    } catch (e) {
      showToast('Erro ao limpar dados', 'error');
    }
  }

  // Event listeners
  refreshBtn.addEventListener('click', () => {
    renderResponses();
    showToast('Lista atualizada', 'success');
  });

  exportBtn.addEventListener('click', exportToJSON);
  clearLocalBtn.addEventListener('click', clearLocalDrafts);

  // Atualizar contador de enviados e mostrar na lista
  function loadSubmittedResponses() {
    try {
      const enviados = localStorage.getItem(SUBMISSIONS_KEY);
      if (enviados) {
        const parsed = JSON.parse(enviados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          totalEnviadosEl.textContent = parsed.length;
          
          // Adicionar respostas enviadas à lista
          const submittedResponses = parsed.map(sub => ({
            key: SUBMISSIONS_KEY,
            data: sub,
            timestamp: sub.timestamp || sub.date || new Date().toISOString(),
            submitted: true
          }));
          
          // Combinar com rascunhos e renderizar
          const allResponses = getAllLocalStorageData();
          const combined = [...submittedResponses, ...allResponses.filter(r => r.key !== SUBMISSIONS_KEY)];
          
          if (combined.length > 0) {
            renderCombinedResponses(combined);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar respostas enviadas:', e);
    }
  }

  function renderCombinedResponses(responses) {
    const sorted = responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    totalRascunhosEl.textContent = sorted.length;

    responsesContainer.innerHTML = sorted.map((response, index) => {
      const data = response.data;
      const isSubmitted = response.submitted || response.key === SUBMISSIONS_KEY;
      const questions = [
        { key: 'q1', label: 'Pergunta 1: Maior preocupação da empresa' },
        { key: 'q2', label: 'Pergunta 2: Público-alvo do desenvolvimento' },
        { key: 'q3', label: 'Pergunta 3: Tratamento do desenvolvimento humano' },
        { key: 'q4', label: 'Pergunta 4: Modelo ou referência' },
        { key: 'q4_outro', label: 'Especificação (Q4)' },
        { key: 'q5_sugestoes', label: 'Sugestões para desenvolvimento' }
      ];

      const fieldsHtml = questions.map(q => {
        const value = data[q.key];
        if (!value || (typeof value === 'string' && value.trim() === '')) return '';
        
        return `
          <div class="response-field">
            <div class="response-label">${q.label}</div>
            <div class="response-value">${escapeHtml(String(value))}</div>
          </div>
        `;
      }).filter(f => f).join('');

      return `
        <div class="response-item" style="border-left: ${isSubmitted ? '4px solid var(--success)' : '4px solid var(--primary)'};">
          <div class="response-header">
            <div>
              <strong>${isSubmitted ? '✅ Enviada' : '📝 Rascunho'} #${index + 1}</strong>
              <div class="response-date">${formatDate(response.timestamp)}</div>
            </div>
            <div class="response-date" style="font-size: 11px; opacity: 0.7;">${isSubmitted ? 'Enviado' : 'Rascunho local'}</div>
          </div>
          <div class="response-data">
            ${fieldsHtml || '<p style="color: var(--text-secondary); font-size: 12px;">Dados incompletos</p>'}
          </div>
        </div>
      `;
    }).join('');
  }

  // Carregar ao iniciar
  renderResponses();
})();

