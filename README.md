# Aplicativo Empresa – Diagnóstico de Desenvolvimento Humano

Aplicativo mobile (HTML+CSS+JS) para coletar respostas sobre prioridades de RH. Visual moderno, rápido, responsivo e preparado para Netlify Forms.

## Recursos
- Formulário com 5 perguntas (4 objetivas + 1 texto livre)
- Integração com Netlify Forms (`data-netlify="true"` e `form-name`)
- Salvamento local de rascunho (`localStorage`)
- Página de sucesso após envio (`success.html`)
- Painel administrativo para visualizar respostas (`admin.html`)

## Rodando localmente
```sh
python3 -m http.server 8000
# abra http://localhost:8000/
```

## Deploy no Netlify
1. Importe este repositório no Netlify (Import from Git) ou use Drag & Drop da pasta.
2. Após o primeiro deploy, o formulário aparecerá em Netlify → Forms → `diagnostico`.
3. O envio em produção redireciona para `success.html`.

## 📊 Como Visualizar as Respostas dos Usuários

### Opção 1: Painel Netlify (Recomendado - Todas as respostas enviadas)
As respostas dos usuários são armazenadas automaticamente no **Netlify Forms**:
1. Acesse o painel do Netlify (https://app.netlify.com)
2. Vá para **Forms** no menu lateral
3. Procure pelo formulário chamado **`diagnostico`**
4. Clique para ver todas as submissões
5. Você pode:
   - Ver cada resposta individualmente
   - Exportar todos os dados em CSV ou JSON
   - Configurar notificações por email

### Opção 2: Painel Administrativo Local (Rascunhos e histórico)
Acesse `admin.html` no navegador para:
- Visualizar rascunhos salvos localmente
- Ver histórico de respostas enviadas (registrado localmente)
- Exportar dados em JSON
- Limpar rascunhos locais

**Nota:** O painel local mostra apenas dados salvos no navegador atual. As respostas reais estão no Netlify.

## Estrutura
- `index.html` – formulário e layout
- `styles.css` – estilos mobile-first
- `script.js` – salvamento local e lógica do formulário
- `success.html` – confirmação pós-envio
- `admin.html` – painel administrativo para visualizar respostas
- `admin.js` – lógica do painel administrativo

## Personalização
- Cores em `styles.css` (variáveis CSS)
- Título/brand em `index.html`

## Licença
Uso interno da empresa.