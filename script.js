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
  document.querySelectorAll('meta[name=theme-color]').forEach(meta => { meta.content = escuro ? '#05081a' : '#f5f6fb'; });
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
  const chat = fig.querySelector('.chat:not([hidden])');
  const ponto = Object.assign(document.createElement('li'), {
    className: 'msg ele digitando vista',
    innerHTML: '<i></i><i></i><i></i>',
  });
  ponto.setAttribute('aria-hidden', 'true');

  for (const li of chat.querySelectorAll('.msg:not(.vista, .digitando)')) {
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

// "Na prática": um celular, várias conversas. Cada <ol class="chat"> é uma aba.
const vitrine = document.querySelector('.vitrine');
const conversas = vitrine.querySelectorAll('.chat');
const abas = document.querySelectorAll('[data-aba]');
const inicial = vitrine.querySelector('.avatar');
const nome = vitrine.querySelector('.zap-nome strong');
const sub = vitrine.querySelector('.zap-nome small');
const forte = vitrine.querySelector('.frase strong');
const resto = vitrine.querySelector('.frase span');

// No celular as abas deslizam: o foco do teclado deixa a aba inteira à vista, com o contorno sem corte
abas.forEach(aba => aba.addEventListener('focus', () => aba.scrollIntoView({ block: 'nearest', inline: 'nearest' })));
abas.forEach((aba, i) => aba.addEventListener('click', () => {
  abas.forEach(outra => outra.setAttribute('aria-pressed', outra === aba));
  conversas.forEach((chat, j) => { chat.hidden = j !== i; });
  const dados = conversas[i].dataset;
  inicial.textContent = dados.inicial;
  nome.textContent = dados.nome;
  sub.textContent = dados.sub || 'conta comercial';
  forte.textContent = dados.forte;
  resto.textContent = dados.resto;
  conversas[i].querySelectorAll('.msg').forEach(msg => msg.classList.remove('vista'));
  if (!calmo) tocar(vitrine);
}));

if (!calmo) aoEntrar(document.querySelectorAll('[data-toca]'), .35, tocar);

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
