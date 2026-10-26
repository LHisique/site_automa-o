// node test_trava.js
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const ctx = {};
vm.runInNewContext(fs.readFileSync(__dirname + '/trava.js', 'utf8') + ';this.travarSaida = travarSaida;', ctx);
const { travarSaida } = ctx;

// link oficial passa, com pontuação no fim
assert.strictEqual(travarSaida('Segue: https://pay.hotmart.com/PRODUTO-A.').bloqueadas.length, 0);
// link inventado num domínio vigiado troca a resposta inteira
const r = travarSaida('O PRODUTO-C está em https://pay.hotmart.com/PRODUTO-C');
assert.strictEqual(r.bloqueadas.length, 1);
assert.match(r.texto, /confirmar/);
// markdown vira texto e negrito vira asterisco simples
assert.strictEqual(travarSaida('**Curso** [aqui](https://pay.hotmart.com/PRODUTO-B)').texto, '*Curso* aqui: https://pay.hotmart.com/PRODUTO-B');
// domínio fora da lista vigiada não é bloqueado
assert.strictEqual(travarSaida('Veja https://www.gov.br').bloqueadas.length, 0);

console.log('trava ok');
