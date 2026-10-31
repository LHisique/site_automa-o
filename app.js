// Turno. O iPhone acompanha a rolagem até "Na prática" e para ali. Fundo: pontos soltos que viram fios.
import * as THREE from "three";

const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const html = document.documentElement;
html.classList.add("js");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const suave = (t) => t * t * (3 - 2 * t);
const WHATSAPP = "5518991919081";

/* ---------- Relógio do "turno ativo" ---------- */
const relogio = $(".topo .relogio");
const hora = () => (relogio.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
hora(); setInterval(hora, 15000);
$(".status .relogio").textContent = "23:48";

/* ---------- Rolagem suave, âncoras e menu ---------- */
let lenis = null;
if (!reduzido && window.Lenis) lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
const menuBotao = $(".topo-menu"), menu = $("#menu-celular");
function menuAberto(abrir) {
  menu.hidden = !abrir;
  menuBotao.setAttribute("aria-expanded", String(abrir));
  menuBotao.textContent = abrir ? "Fechar" : "Menu";
  abrir ? lenis?.stop() : lenis?.start();
}
menuBotao.addEventListener("click", () => menuAberto(menu.hidden));
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const alvo = document.getElementById(decodeURIComponent(a.hash.slice(1)));
  if (!alvo) return;
  e.preventDefault();
  if (!menu.hidden) menuAberto(false);
  lenis ? lenis.scrollTo(alvo, { duration: 1.6 }) : alvo.scrollIntoView();
  history.replaceState(null, "", a.hash);
});

/* ---------- Título palavra a palavra e revelações ---------- */
$$("[data-palavras]").forEach((el) => {
  const texto = el.textContent.trim();
  el.setAttribute("aria-label", texto);
  el.innerHTML = texto.split(/\s+/).map((p, i) => `<span class="palavra" aria-hidden="true"><span style="--i:${i}">${p}</span></span>`).join(" ");
});
const obs = new IntersectionObserver((itens) => itens.forEach((it) => {
  if (!it.isIntersecting) return;
  it.target.classList.add("visivel");
  obs.unobserve(it.target);
}), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
$$(".revela").forEach((el) => !el.closest(".heroi") && obs.observe(el));

/* ---------- Conversas que se escrevem sozinhas ---------- */
const iphone = $(".iphone");
let rodada = 0;
function tocarChat(ol, aoMostrar) {
  const minha = ++rodada;
  const msgs = $$(".msg", ol);
  msgs.forEach((m) => m.classList.remove("mostra"));
  $$(".digitando", ol).forEach((d) => d.remove());
  if (reduzido) { msgs.forEach((m, i) => { m.classList.add("mostra"); aoMostrar?.(i); }); return; }
  let t = 350;
  msgs.forEach((m, i) => {
    const ele = m.classList.contains("ele");
    if (ele) {
      setTimeout(() => { if (minha !== rodada) return; const d = document.createElement("li"); d.className = "digitando"; d.setAttribute("aria-hidden", "true"); d.innerHTML = "<i></i><i></i><i></i>"; m.before(d); }, t);
      t += 1100;
    }
    setTimeout(() => {
      if (minha !== rodada) return;
      $$(".digitando", ol).forEach((d) => d.remove());
      m.classList.add("mostra");
      aoMostrar?.(i);
    }, t);
    t += m.classList.contains("sistema") ? 350 : 750;
  });
}
const flutuas = $$(".flutua");
const chatHeroi = $('[data-chat="heroi"]');
function tocarHeroi() {
  flutuas.forEach((f) => f.classList.remove("ligado"));
  tocarChat(chatHeroi, (i) => {
    if (i === 2) flutuas[0].classList.add("ligado");
    if (i === 3) flutuas[1].classList.add("ligado");
    if (i === 4) flutuas[2].classList.add("ligado");
  });
}
$$(".notificacoes li").forEach((li, i) => li.style.setProperty("--d", i));

/* Abas de "Na prática" */
const abas = $$("[data-aba]"), chats = $$("[data-aba-chat]"), frase = $(".frase");
let abaAtual = 0;
function mostrarAba(n, tocar = true) {
  abaAtual = n;
  abas.forEach((b, i) => b.setAttribute("aria-pressed", String(i === n)));
  chats.forEach((c, i) => (c.hidden = i !== n));
  const c = chats[n];
  $("[data-inicial]").textContent = c.dataset.inicial;
  $("[data-nome]").textContent = c.dataset.nome;
  $("[data-sub]").textContent = c.dataset.sub || "conta comercial";
  frase.innerHTML = `<strong>${c.dataset.forte}</strong> <span>${c.dataset.resto}</span>`;
  if (tocar) tocarChat(c);
}
abas.forEach((b, i) => b.addEventListener("click", () => mostrarAba(i)));

let telaAtual = "";
function trocarTela(t) {
  if (t === telaAtual) return;
  telaAtual = t;
  iphone.dataset.tela = t;
  if (t === "heroi") tocarHeroi();
  if (t === "pratica") mostrarAba(abaAtual);
}


/* ---------- Formulário: abre o WhatsApp com a mensagem pronta ---------- */
$("#form-contato").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, d = Object.fromEntries(new FormData(f)), aviso = $(".formulario-aviso", f);
  const falta = ["nome", "empresa", "desafio"].find((k) => !String(d[k] || "").trim());
  if (falta) { aviso.textContent = "Preencha os três campos para abrir o WhatsApp."; f[falta].focus(); return; }
  const texto = `Olá, Luís! Sou ${d.nome.trim()}, da ${d.empresa.trim()}.\n\n${d.desafio.trim()}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  aviso.textContent = "Abrimos o WhatsApp com a sua mensagem pronta.";
});

/* ---------- Mouse: o cursor é o do sistema; as partículas e o iPhone reagem a ele ---------- */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, vx: 0, vy: 0, nx: 0, ny: 0 };
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  mouse.vx += e.clientX - mouse.x; mouse.vy += e.clientY - mouse.y;
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = (e.clientX / innerWidth) * 2 - 1; mouse.ny = -(e.clientY / innerHeight) * 2 + 1;
}, { passive: true });

/* ---------- Poses do iPhone, uma por passo da jornada ---------- */
const passos = $$("[data-passo]");
(() => {
  // 32 fatias = 32 px de espessura. Brilho segue o perfil arredondado da lateral (escuro nas quinas, claro no meio).
  const camadas = $(".iphone-camadas"), N = 32;
  let h = "";
  for (let k = 1; k <= N; k++) {
    const t = k / N, perfil = Math.pow(Math.sin(Math.PI * Math.min(t, 0.98)), 0.55);
    const L = 0.42 + perfil * 0.5, c = (v) => Math.round(Math.min(255, v * L));
    const fatia = k === N
      ? "radial-gradient(120% 90% at 30% 15%, #4a4843, #23221f 60%, #161513)"
      : `linear-gradient(140deg, rgb(${c(250)},${c(246)},${c(236)}), rgb(${c(150)},${c(147)},${c(139)}) 30%, rgb(${c(205)},${c(201)},${c(192)}) 58%, rgb(${c(120)},${c(118)},${c(111)}) 85%)`;
    h += `<i style="--z:${(-k).toFixed(2)}px;--fatia:${fatia}"></i>`;
  }
  camadas.innerHTML = h;
})();
const poses = {
  heroi:    { rx: 9, ry: -22, rz: 5,  y: 0,  s: 1 },
  bloqueio: { rx: 4, ry: 17,  rz: -3, y: 8, s: 0.98 },
  pratica:  { rx: 0,  ry: 0,   rz: 0,  y: 0,  s: 1 },
};
const cena3d = $(".cena3d"), frente = $(".iphone-frente"), sombra = $(".sombra");
const jornada = $(".jornada");
let intro = reduzido ? 1 : 0;

/* Tamanho do celular conforme a tela */
let larguraAnterior = innerWidth;
// No toque, a barra de endereço muda só a altura ao rolar: ignora esse resize para o celular não "pular".
const soAltura = () => { const igual = matchMedia("(pointer: coarse)").matches && innerWidth === larguraAnterior; larguraAnterior = innerWidth; return igual; };
// Métricas do celular (até 960px): o texto do passo fica preso no alto e o iPhone, inteiro, embaixo.
// Mede o maior bloco de texto e dá ao iPhone só a altura que sobra, então os dois nunca se cruzam.
const palco = $(".palco"), conteudos = passos.map((p) => $(".passo-conteudo", p));
let celular = false, topoTexto = 0;
function escalar() {
  celular = innerWidth <= 960;
  const pratica = passos[passos.length - 1];
  if (!celular) {
    pratica.style.paddingBottom = "";
    $(".cena3d").style.setProperty("--escala", clamp((innerHeight * 0.8) / 620, 0.7, 1.3).toFixed(3));
    return;
  }
  topoTexto = $(".topo").offsetHeight + 4;
  html.style.setProperty("--topo-texto", `${topoTexto}px`);
  const alturaTela = palco.clientHeight; // 100svh: não muda com a barra de endereço
  const texto = Math.max(...conteudos.map((c) => c.offsetHeight));
  const livre = alturaTela - topoTexto - texto - 20 - 12; // folga entre texto e iPhone, e margem de baixo
  $(".cena3d").style.setProperty("--escala", clamp(livre / 650, 0.3, 0.85).toFixed(3)); // 650 = 620 do aparelho + giro em 3D
  // o texto da prática solta junto com o iPhone no fim da jornada
  pratica.style.paddingBottom = `${Math.max(0, alturaTela - topoTexto - conteudos[conteudos.length - 1].offsetHeight)}px`;
}
function passoAtivo() {
  let a = 0;
  passos.forEach((p, i) => { if (p.getBoundingClientRect().top <= topoTexto + 1) a = i; });
  // o texto que está saindo some assim que começa a subir, para não passar por baixo do topo
  const saindo = a < passos.length - 1 && conteudos[a].getBoundingClientRect().top < topoTexto - 2;
  passos.forEach((p, i) => p.classList.toggle("ativo", !celular || (i === a && !saindo)));
}
escalar(); addEventListener("resize", () => { if (!soAltura()) escalar(); });
function poseAtual(t) {
  const meio = innerHeight / 2;
  // posição contínua entre os centros dos passos (0 = topo, 1 = cenas, 2 = prática)
  const centros = passos.map((p) => { const r = p.getBoundingClientRect(); return p.dataset.passo === "pratica" ? r.top + innerHeight * 0.5 : r.top + r.height / 2; });
  let k = 0;
  if (meio >= centros[centros.length - 1]) k = centros.length - 1;
  else for (let i = 0; i < centros.length - 1; i++) {
    if (meio >= centros[i] && meio < centros[i + 1]) { k = i + suave((meio - centros[i]) / (centros[i + 1] - centros[i])); break; }
  }
  const a = poses[passos[Math.floor(k)].dataset.passo];
  const b = poses[passos[Math.min(passos.length - 1, Math.floor(k) + 1)].dataset.passo];
  const f = k - Math.floor(k);
  const p = {}; for (const c in a) p[c] = lerp(a[c], b[c], f);
  // vida: flutua e reage ao mouse, e vai parando ao chegar em "Na prática"
  const vida = reduzido ? 0 : clamp(2 - k);
  p.rx += (Math.sin(t * 0.55) * 1.2 - mouse.ny * 3) * vida;
  p.ry += (Math.sin(t * 0.4) * 2 + mouse.nx * 5) * vida;
  p.y += Math.sin(t * 0.8) * 6 * vida;
  // entrada: o celular sobe girando
  const e = 1 - Math.pow(1 - intro, 3);
  p.rx += (1 - e) * 38; p.ry += (1 - e) * -30; p.y += (1 - e) * 220; p.s *= 0.85 + e * 0.15;
  return { p, k };
}
function criarCampo(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 1.75));
  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const pequeno = innerWidth < 760;
  const N = pequeno ? 2800 : 7200;
  const A = new Float32Array(N * 3), B = new Float32Array(N * 3), C = new Float32Array(N * 3), R = new Float32Array(N * 4);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const cols = Math.ceil(Math.sqrt(N * 1.9)), linhas = Math.ceil(N / cols);
  const pistas = 15;
  for (let i = 0; i < N; i++) {
    // A: caos (as tarefas soltas do negócio)
    A[i * 3] = gauss() * 9 + 1.5; A[i * 3 + 1] = gauss() * 5.2 + 0.6; A[i * 3 + 2] = gauss() * 5;
    // B: grade precisa (o plano)
    const cx = i % cols, cy = Math.floor(i / cols);
    B[i * 3] = (cx / (cols - 1) - 0.5) * 20; B[i * 3 + 1] = (cy / (linhas - 1) - 0.5) * 11; B[i * 3 + 2] = -2;
    // C: fluxos (o piloto automático)
    const p = i % pistas;
    C[i * 3] = (Math.random() - 0.5) * 26; C[i * 3 + 1] = (p / (pistas - 1) - 0.5) * 9; C[i * 3 + 2] = (p % 3) * -1.2 + Math.random() * 0.3;
    R[i * 4] = Math.random(); R[i * 4 + 1] = Math.random(); R[i * 4 + 2] = p; R[i * 4 + 3] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(A, 3));
  geo.setAttribute("aB", new THREE.BufferAttribute(B, 3));
  geo.setAttribute("aC", new THREE.BufferAttribute(C, 3));
  geo.setAttribute("aR", new THREE.BufferAttribute(R, 4));

  const u = {
    uTempo: { value: 0 }, uMix: { value: 0 }, uOpacidade: { value: 1 },
    uMouse: { value: new THREE.Vector2(99, 99) }, uForca: { value: 0 },
    uPR: { value: renderer.getPixelRatio() }, uEscala: { value: pequeno ? 0.8 : 1 },
    uTinta: { value: new THREE.Color("#EEF0EA") }, uAcento: { value: new THREE.Color("#8FE3B0") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aB; attribute vec3 aC; attribute vec4 aR;
      uniform float uTempo, uMix, uForca, uPR, uEscala; uniform vec2 uMouse;
      varying float vBrilho; varying float vAcento;
      void main() {
        float t = uTempo;
        vec3 a = position + vec3(sin(t*.31 + aR.y*6.283), cos(t*.27 + aR.x*6.283), sin(t*.23 + aR.w*6.283)) * .45;
        vec3 c = aC;
        float vel = .55 + fract(aR.z * .618) * .9;
        c.x = mod(c.x + t * vel * 1.4 + 13., 26.) - 13.;
        c.y += sin(c.x * .42 + aR.z * 1.7) * .32;
        float m1 = smoothstep(aR.x * .45, aR.x * .45 + .55, uMix);
        float m2 = smoothstep(1. + aR.y * .45, 1.55 + aR.y * .45, uMix);
        vec3 p = mix(mix(a, aB, m1), c, m2);
        // varredura do diagnóstico
        float faixa = sin(t * .8) * 6.;
        float scan = (1. - m1) * smoothstep(.5, 0., abs(p.y - faixa * .9)) * step(.05, uMix);
        // a "mão manual" do visitante bagunça, o sistema reorganiza sozinho
        vec2 d = p.xy - uMouse;
        float dist2 = dot(d, d);
        float empurra = uForca * exp(-dist2 / 3.2);
        p.xy += normalize(d + 1e-4) * empurra * 2.2;
        p.z += empurra * 1.5 * (aR.w - .5);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        vAcento = step(.955, aR.w) + scan * .6;
        float base = mix(.9, 1.1, m2) + scan * 1.4 + empurra * .8;
        vBrilho = base * (.45 + aR.w * .55);
        gl_PointSize = (2.6 + aR.w * 3.4 + vAcento * 2.2) * uPR * uEscala * (15. / -mv.z);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uTinta, uAcento; uniform float uOpacidade;
      varying float vBrilho; varying float vAcento;
      void main() {
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, .05, d);
        vec3 cor = mix(uTinta, uAcento, clamp(vAcento, 0., 1.));
        gl_FragColor = vec4(cor * a * vBrilho * uOpacidade, a * vBrilho * uOpacidade);
      }`,
  });
  const pontos = new THREE.Points(geo, mat);
  cena.add(pontos);

  const ray = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  let ultimaLargura = 0;
  function tamanho() {
    // usa o tamanho real do canvas (CSS 100% do viewport), não innerWidth/innerHeight
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    if (matchMedia("(pointer: coarse)").matches && w === ultimaLargura) return; // só a barra de endereço mudou
    ultimaLargura = w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 760 ? 19 : 14;
    camera.updateProjectionMatrix();
  }
  tamanho();
  addEventListener("resize", tamanho);

  return {
    quadro(t, mix, opacidade, forca) {
      canvas.style.opacity = opacidade > 0.005 ? 1 : 0;
      if (opacidade <= 0.005) return;
      u.uTempo.value = t; u.uMix.value = mix; u.uOpacidade.value = opacidade; u.uForca.value = forca;
      ray.setFromCamera({ x: mouse.nx, y: mouse.ny }, camera);
      if (ray.ray.intersectPlane(plano, hit)) u.uMouse.value.set(hit.x, hit.y);
      pontos.rotation.y = lerp(pontos.rotation.y, mouse.nx * 0.12, 0.04);
      pontos.rotation.x = lerp(pontos.rotation.x, -mouse.ny * 0.06, 0.04);
      renderer.render(cena, camera);
    },
  };
}

/* ---------- Campo de pontos ---------- */
const canvas = $("#campo");
let campo = null;
try { campo = criarCampo(canvas); } catch (err) { canvas.remove(); }

/* ---------- Laço único ---------- */
let forca = 0, mix = 0, opac = 1;
const t0 = performance.now();
function quadro(agora) {
  lenis?.raf(agora);
  const t = (agora - t0) / 1000;
  if (!reduzido) intro = clamp((t - 0.25) / 1.8);
  const { p, k } = poseAtual(t);
  iphone.style.transform = `translate3d(0, ${p.y}px, 0) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s})`;
  frente.style.setProperty("--brilho", `${50 + p.ry * 1.6}%`);
  sombra.style.setProperty("--sombra", (0.7 + Math.cos(p.ry * Math.PI / 180) * 0.3).toFixed(3));
  sombra.style.setProperty("--sombra-x", `${(-p.ry * 1.2).toFixed(1)}px`);
  trocarTela(passos[Math.round(k)].dataset.passo);
  passoAtivo();

  // fundo: caos no topo, fios na prática; mais discreto depois da jornada
  const rj = jornada.getBoundingClientRect();
  const dentro = rj.bottom > innerHeight * 0.5;
  mix = lerp(mix, clamp(k, 0, 2), 0.05);
  opac = lerp(opac, dentro ? 1 : 0.28, 0.05);

  const vel = Math.hypot(mouse.vx, mouse.vy); mouse.vx = mouse.vy = 0;
  forca = lerp(forca, clamp(vel / 40, 0, 1.6), vel > forca * 40 ? 0.25 : 0.035);
  campo?.quadro(t, mix, opac, forca);
  if (!reduzido) requestAnimationFrame(quadro);
}

document.fonts.ready.then(() => requestAnimationFrame(() => {
  html.classList.add("pronto");
  escalar();
  $$(".heroi .revela").forEach((el) => el.classList.add("visivel"));
}));
if (reduzido) {
  quadro(performance.now());
  addEventListener("scroll", () => quadro(performance.now()), { passive: true });
} else requestAnimationFrame(quadro);
