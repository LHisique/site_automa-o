# Turno

Site de divulgação de automação de WhatsApp com IA. HTML, CSS e JavaScript, sem cookies e sem chamadas externas: fontes e códigos ficam em `assets/`.

Abra `index.html` no navegador.

| O quê | Onde |
|---|---|
| Número de WhatsApp | `WHATSAPP` no topo de `app.js` e o link `wa.me` em `index.html` |
| E-mail | `index.html` (contato) e `privacidade.html` |
| CPF e hospedagem (Netlify) | `privacidade.html` |
| Conversas do celular | `index.html`: cada `<ol class="chat">` dentro do iPhone |
| Poses do iPhone na rolagem | objeto `poses` em `app.js` (`ry` acumula: uma volta inteira da abertura à tela de bloqueio) |
| iPhone 3D | `fone.js`; cor do titânio na constante `COR`; modelo embutido em `assets/iphone-glb.js` |

Se editar `app.js`, gere de novo o arquivo que a página usa:

```
npx esbuild app.js --bundle --format=iife --minify --alias:three=./assets/vendor/three.module.min.js --outfile=assets/app.min.js
```

## Crédito do modelo 3D

"Iphone 16 Pro Max" de [shig0](https://sketchfab.com/shig0), licença [CC-BY 4.0](http://creativecommons.org/licenses/by/4.0/) (uso comercial permitido com crédito). O crédito está no rodapé, em "Para quem é técnico". Mantenha-o. O modelo foi otimizado (sem a textura de papel de parede da Apple) e embutido em `assets/iphone-glb.js`.
