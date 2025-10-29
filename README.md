# Aplicativo Empresa – Diagnóstico de Desenvolvimento Humano

Aplicativo mobile (HTML+CSS+JS) para coletar respostas sobre prioridades de RH. Visual moderno, rápido, responsivo e preparado para Netlify Forms.

## Recursos
- Formulário com 4 perguntas objetivas (radios)
- Integração com Netlify Forms (`data-netlify="true"` e `form-name`)
- Salvamento local de rascunho (`localStorage`)
- Página de sucesso após envio (`success.html`)

## Rodando localmente
```sh
python3 -m http.server 8000
# abra http://localhost:8000/
```

## Deploy no Netlify
1. Importe este repositório no Netlify (Import from Git) ou use Drag & Drop da pasta.
2. Após o primeiro deploy, o formulário aparecerá em Netlify → Forms → `diagnostico`.
3. O envio em produção redireciona para `success.html`.

## Estrutura
- `index.html` – formulário e layout
- `styles.css` – estilos mobile-first
- `script.js` – salvamento local e lógica do formulário
- `success.html` – confirmação pós-envio

## Personalização
- Cores em `styles.css` (variáveis CSS)
- Título/brand em `index.html`

## Licença
Uso interno da empresa.