# Turno

Site de divulgação de automação de WhatsApp com IA. HTML, CSS e JavaScript, sem cookies e sem chamadas externas: fontes e códigos ficam em `assets/`.

Abra `index.html` no navegador.

| O quê | Onde |
|---|---|
| Número de WhatsApp | `WHATSAPP` no topo de `app.js` e o link `wa.me` em `index.html` |
| E-mail | `index.html` (contato) e `privacidade.html` |
| CPF e hospedagem (Netlify) | `privacidade.html` |
| Conversas do celular | `index.html`: cada `<ol class="chat">` dentro do iPhone |
| Poses do iPhone na rolagem | objeto `poses` em `app.js` |

Se editar `app.js`, gere de novo o arquivo que a página usa:

```
npx esbuild app.js --bundle --format=iife --minify --alias:three=./assets/vendor/three.module.min.js --outfile=assets/app.min.js
```
