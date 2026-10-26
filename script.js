const CONTATO = {
  whatsapp: '5518991919081', // só números, com DDI e DDD
};

const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const espera = ms => new Promise(resolve => setTimeout(resolve, ms));

// Menu do celular: fecha ao escolher uma seção ou com Esc
const menu = document.querySelector('.menu-movel');
menu.addEventListener('click', e => { if (e.target.closest('a')) menu.open = false; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});

// Tema: segue o aparelho até a pessoa escolher; a escolha fica só neste navegador
const raiz = document.documentElement;
const botoesTema = document.querySelectorAll('[data-tema-botao]');
function sincronizarTema() {
  const escuro = raiz.dataset.tema === 'escuro';
  botoesTema.forEach(botao => botao.setAttribute('aria-pressed', escuro));
  document.querySelectorAll('meta[name=theme-color]').forEach(meta => { meta.content = escuro ? '#070b1f' : '#f3f5fa'; });
}
sincronizarTema();
botoesTema.forEach(botao => botao.addEventListener('click', () => {
  raiz.dataset.tema = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
  try { localStorage.setItem('tema', raiz.dataset.tema); } catch {}
  sincronizarTema();
}));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  try { if (localStorage.getItem('tema')) return; } catch {}
  raiz.dataset.tema = e.matches ? 'escuro' : 'claro';
  sincronizarTema();
});

// Executa fn uma vez, quando o elemento aparece na tela
function aoEntrar(alvos, limite, fn) {
  const olho = new IntersectionObserver(entradas => entradas.forEach(e => {
    if (!e.isIntersecting) return;
    olho.unobserve(e.target);
    fn(e.target);
  }), { threshold: limite });
  alvos.forEach(alvo => olho.observe(alvo));
}
aoEntrar(document.querySelectorAll('[data-revela]'), .15, el => el.classList.add('dentro'));

// Conversa que se escreve sozinha. A mensagem do negócio entra depois de “digitando”;
// data-mostra="N" faz um elemento aparecer quando N mensagens já estão na tela.
async function tocar(fig) {
  const minha = fig.corrida = (fig.corrida || 0) + 1;
  const chat = fig.querySelector('.chat');
  const ponto = Object.assign(document.createElement('li'), {
    className: 'msg ele digitando vista',
    innerHTML: '<i></i><i></i><i></i>',
  });
  ponto.setAttribute('aria-hidden', 'true');

  for (const li of chat.querySelectorAll('.msg:not(.vista)')) {
    const negocio = li.classList.contains('ele');
    if (negocio) li.before(ponto);
    await espera(negocio ? 800 + li.textContent.length * 10 : 600);
    ponto.remove();
    if (fig.corrida !== minha) return;

    const tique = li.querySelector('.tique');
    if (tique) {
      tique.classList.remove('lido');
      setTimeout(() => tique.classList.add('lido'), 1000);
    }
    li.classList.add('vista');
    const visiveis = chat.querySelectorAll('.msg.vista').length;
    fig.querySelectorAll(`[data-mostra="${visiveis}"]`).forEach(el => el.classList.add('vista'));
  }
}

// Demonstração da conferência: usa o mesmo travarSaida do trava.js
const CASOS = {
  correto: {
    pergunta: 'Quero fechar o plano anual. Qual é o link?',
    rascunho: 'Claro! Aqui está o link do plano anual: https://pay.hotmart.com/PRODUTO-A',
  },
  inventado: {
    pergunta: 'Vocês têm o curso avançado?',
    rascunho: 'Temos sim! A inscrição é neste link: https://pay.hotmart.com/PRODUTO-C',
  },
  misto: {
    pergunta: 'Me manda os links dos dois planos?',
    rascunho: 'Claro! Mensal: https://pay.hotmart.com/PRODUTO-B e anual: https://pay.hotmart.com/PRODUTO-D',
  },
};

const demo = document.getElementById('trava-demo');
const conversa = demo.querySelector('.chat');

// Texto com os links em destaque; os barrados ficam riscados nos bastidores
const partes = (texto, barrados = []) => texto.split(/(https?:\/\/[^\s)]+)/).map((parte, i) => {
  if (i % 2 === 0) return document.createTextNode(parte);
  const link = document.createElement('span');
  link.className = barrados.includes(parte) ? 'link barrado' : 'link';
  link.textContent = parte.replace(/^https?:\/\//, '');
  return link;
});

function bolha(lado, texto, hora) {
  const li = document.createElement('li');
  li.className = `msg ${lado} cauda`;
  const meta = document.createElement('span');
  meta.className = 'meta';
  meta.innerHTML = hora + (lado === 'eu' ? '<svg class="tique lido" aria-hidden="true"><use href="#i-tique"/></svg>' : '');
  li.append(...partes(texto), meta);
  return li;
}

function mostrar(chave) {
  const { pergunta, rascunho } = CASOS[chave];
  const { texto, bloqueadas } = travarSaida(rascunho);
  const barrou = bloqueadas.length > 0;
  const veredito = barrou
    ? 'Link fora da lista oficial. Por segurança, a resposta inteira foi trocada.'
    : 'Link na lista oficial. A resposta pode ser enviada.';

  const hoje = Object.assign(document.createElement('li'), { className: 'msg sistema', textContent: 'Hoje' });
  conversa.replaceChildren(hoje, bolha('eu', pergunta, '14:05'), bolha('ele', texto, '14:05'));
  document.getElementById('b-rascunho').replaceChildren(...partes(rascunho, bloqueadas));
  document.getElementById('b-veredito').className = 'veredito ' + (barrou ? 'barra' : 'ok');
  document.getElementById('b-icone').setAttribute('href', barrou ? '#i-x' : '#i-ok');
  document.getElementById('b-texto').textContent = veredito;
  document.getElementById('trava-status').textContent = `${veredito} O cliente recebeu: ${texto.replace(/https?:\/\//g, '')}`;

  demo.querySelectorAll('[data-mostra]').forEach(el => el.classList.toggle('vista', calmo));
  if (calmo) conversa.querySelectorAll('.msg').forEach(msg => msg.classList.add('vista'));
  else tocar(demo);
}

const botoes = document.querySelectorAll('[data-caso]');
botoes.forEach(botao => botao.addEventListener('click', () => {
  botoes.forEach(outro => outro.setAttribute('aria-pressed', outro === botao));
  mostrar(botao.dataset.caso);
}));

if (calmo) mostrar('inventado');
else {
  aoEntrar([demo], .35, () => mostrar('inventado'));
  aoEntrar(document.querySelectorAll('.palco[data-toca]'), .35, tocar);
}

// Formulário de contato: monta a mensagem e abre o WhatsApp
const aviso = document.getElementById('aviso-form');
document.getElementById('form-contato').addEventListener('submit', evento => {
  evento.preventDefault();
  if (!CONTATO.whatsapp) {
    aviso.textContent = 'Falta configurar o número de WhatsApp: preencha CONTATO.whatsapp no script.js.';
    return;
  }
  const dados = new FormData(evento.target);
  const texto = `Olá, Luís! Sou ${dados.get('nome')}, da ${dados.get('empresa')}.\n\n${dados.get('desafio')}`;
  window.open(`https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  aviso.textContent = 'Abrimos o WhatsApp em outra aba. Falta só enviar a mensagem.';
});
