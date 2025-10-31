# Guia: Netlify Forms com AJAX - Melhores Práticas

## ✅ Configuração Correta do Formulário HTML

```html
<form name="nome_do_formulario" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="nome_do_formulario" />
  <p class="hidden">
    <label>Não preencha: <input name="bot-field" /></label>
  </p>
  
  <!-- Campos do formulário -->
  <!-- IMPORTANTE: Todos os campos devem ter atributo 'name' -->
</form>
```

### Requisitos:
- ✅ `data-netlify="true"` ou `netlify` no `<form>`
- ✅ `name="form-name"` no input hidden com valor igual ao `name` do form
- ✅ Campo `bot-field` para proteção contra spam
- ✅ Todos os campos devem ter atributo `name`

## ✅ Envio AJAX Correto (JavaScript)

### Método Recomendado (Conforme Documentação Oficial):

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Importante: prevenir submit padrão
  
  // Criar FormData do formulário
  const formData = new FormData(form);
  
  // ⚠️ CRÍTICO: Converter para URL-encoded usando URLSearchParams
  const encodedData = new URLSearchParams(formData).toString();
  
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' // ⚠️ OBRIGATÓRIO
      },
      body: encodedData // ⚠️ Deve ser string URL-encoded, não FormData
    });
    
    if (response.ok) {
      // Redirecionar para página de sucesso
      window.location.href = 'success.html';
    }
  } catch (error) {
    console.error('Erro ao enviar:', error);
  }
});
```

## ⚠️ Erros Comuns e Como Evitar

### ❌ ERRO 1: Enviar FormData diretamente
```javascript
// ❌ ERRADO - Netlify não processa FormData diretamente
fetch('/', {
  method: 'POST',
  body: new FormData(form) // ❌ Não funciona!
});
```

### ✅ CORRETO: Converter para URL-encoded
```javascript
// ✅ CORRETO
const formData = new FormData(form);
const encodedData = new URLSearchParams(formData).toString();
fetch('/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: encodedData
});
```

### ❌ ERRO 2: Usar JSON
```javascript
// ❌ ERRADO - Netlify Forms não aceita JSON
fetch('/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### ❌ ERRO 3: Campos disabled não são enviados
```javascript
// ❌ Se um campo está disabled, ele NÃO será enviado
// Solução: Remover o atributo 'name' se o campo não for necessário
if (campo.disabled) {
  campo.removeAttribute('name');
}
```

## 📋 Checklist de Implementação

- [ ] Formulário tem `data-netlify="true"` ou `netlify`
- [ ] Input hidden com `name="form-name"` e valor correto
- [ ] Campo `bot-field` para proteção anti-spam
- [ ] Todos os campos têm atributo `name`
- [ ] JavaScript usa `URLSearchParams` para converter dados
- [ ] Header `Content-Type: application/x-www-form-urlencoded`
- [ ] POST enviado para `/` (raiz do site)
- [ ] Campos disabled têm `name` removido antes do envio
- [ ] Redirecionamento após envio bem-sucedido

## 🔍 Debug e Verificação

### Verificar se o formulário está sendo detectado:
1. Netlify Dashboard → Forms
2. O formulário deve aparecer na lista após deploy
3. Nome será o valor do atributo `name` do `<form>`

### Verificar se os dados estão sendo capturados:
1. Netlify Dashboard → Forms → [Nome do Formulário]
2. Aba "Submissions" deve mostrar as submissões
3. CSV export deve conter todas as colunas dos campos

### Debug no Console:
```javascript
// Verificar dados antes do envio
const formData = new FormData(form);
const encodedData = new URLSearchParams(formData).toString();
console.log('Dados enviados:', encodedData);
// Deve mostrar: form-name=nome&q1=valor&q2=valor...
```

## 📚 Referências

- [Documentação Oficial Netlify Forms](https://docs.netlify.com/forms/setup/)
- [Submissão AJAX de Formulários HTML](https://docs.netlify.com/forms/setup/#submit-html-forms-with-ajax)
- [Formulários JavaScript](https://docs.netlify.com/forms/setup/#work-with-javascript-rendered-forms)

## 💡 Dicas Adicionais

1. **Página de Sucesso Customizada:**
   ```html
   <form action="/success.html" ...>
   ```

2. **File Uploads:**
   - Não incluir header `Content-Type` quando houver uploads
   - Usar `enctype="multipart/form-data"` no form
   - Limite: 8 MB, timeout: 30 segundos

3. **Validação:**
   - Use `form.reportValidity()` antes de enviar
   - Validação HTML5 funciona normalmente

4. **Desenvolvimento Local:**
   - Simular envio em localhost (não funciona sem servidor Netlify)
   - Em produção, funciona automaticamente após deploy

