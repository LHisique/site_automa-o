# site_automa-o

Site de divulgação do trabalho de Luís Isique: automações de WhatsApp com IA para empresas que vendem pelo WhatsApp. HTML, CSS e JavaScript puros, sem dependências, sem cookies e sem chamadas externas.

## Ver no computador

Abra `index.html` no navegador. Se preferir um servidor local, rode `python -m http.server 8000` nesta pasta e acesse http://localhost:8000.

## O que editar

| O quê | Onde |
|---|---|
| Número de WhatsApp do formulário | `CONTATO.whatsapp` em `script.js` (só números, com DDI e DDD) |
| E-mail de contato | `index.html` (seção de contato) e `privacidade.html` |
| CPF/CNPJ e hospedagem | campos `[PREENCHER]` em `privacidade.html` |
| Cores dos temas claro e escuro | variáveis no topo de `style.css` (`:root` e `:root[data-tema='escuro']`) |
| Textos | `index.html` |

## Como funciona

- **Tema claro e escuro:** segue o aparelho. O botão do topo (no celular, dentro do menu) troca o tema e guarda a escolha só no navegador (`localStorage`).
- **"Confere cada link antes de sair":** a demonstração chama o `travarSaida` de `trava.js`, versão simplificada da trava usada nas automações. O teste dela é `node test_trava.js`.
- **Exemplos de conversa:** são ilustrativos (nomes, horários e links fictícios) e a página avisa isso.
- **Formulário:** monta uma mensagem e abre o WhatsApp. Nada passa por este site.

## Publicar

Qualquer hospedagem de site estático serve (GitHub Pages, Netlify, Vercel, Cloudflare Pages): publique a raiz deste repositório. Antes, preencha os `[PREENCHER]` e peça a um advogado que revise a política de privacidade.
