/* iPhone 16 Pro Max em 3D (Three.js).
   Modelo: "Iphone 16 Pro Max" por shig0 (https://sketchfab.com/shig0), licença CC-BY 4.0.
   O modelo cuida do corpo (titânio, vidro, câmeras, botões). A tela é HTML: este módulo
   devolve a transformação CSS que encaixa o HTML sobre o vidro, e se a tela está de frente. */
import * as THREE from "three";
import { GLTFLoader } from "./assets/vendor/three-addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "./assets/vendor/three-addons/environments/RoomEnvironment.js";

// Eixos do aparelho dentro do arquivo do Sketchfab (medidos no próprio modelo): com eles o corpo
// fica em pé, de frente para a câmera, e a altura passa a valer 1 (o arquivo tem 1,634).
const EIXO_X = new THREE.Vector3(-0.8022965778, 0.2771029727, -0.5287098862);
const EIXO_Y = new THREE.Vector3(0.4727748418, 0.8357111984, -0.2794114203);
const EIXO_Z = new THREE.Vector3(0.3644230374, -0.4741315568, -0.8014955487);
const ALTURA_ARQUIVO = 1.634;
// Reserva caso o modelo não tenha a malha da tela: meia-largura, meia-altura e frente do vidro
const TELA = { x: 0.23032, y: 0.48298, z: 0.02528 };
// Acabamento do titânio. Troque aqui para outra cor do iPhone.
const COR = { moldura: "#aaa69c", fundo: "#8e8a82", logo: "#6f6c66" };

function lerGlb(base64) {
  const bin = atob(base64), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function acabamento(raiz) {
  let vidro = null;
  raiz.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    switch (m.name) {
      case "ereve": m.color.set(COR.moldura); m.metalness = 1; m.roughness = 0.3; break; // moldura de titânio
      case "ana_renk": m.color.set(COR.fundo); m.metalness = 0.6; m.roughness = 0.4; break; // vidro fosco de trás
      case "logo": m.color.set(COR.logo); m.metalness = 1; m.roughness = 0.2; break;
      case "wallpaper": // a tela em si: vidro preto; o conteúdo é o HTML por cima
        vidro = o; o.material = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.12, metalness: 0 }); break;
      case "glass": case "cam_materyal": // vidros da câmera, sem transmissão (que pesa muito no celular)
        m.transmission = 0; m.transparent = true; m.opacity = 0.16; m.depthWrite = false; m.roughness = 0.05; m.metalness = 0; m.color.set(0xffffff); break;
    }
  });
  return vidro;
}

export async function criarFone(canvas) {
  if (!window.IPHONE_GLB) throw new Error("modelo ausente");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.95;
  pmrem.dispose();
  // luz de recorte atrás, à direita: desenha o contorno do titânio contra o fundo escuro
  const recorte = new THREE.DirectionalLight(0xffffff, 1.6); recorte.position.set(2.5, 1.5, -2); cena.add(recorte);

  const gltf = await new Promise((ok, erro) => new GLTFLoader().parse(lerGlb(window.IPHONE_GLB), "", ok, erro));
  const vidro = acabamento(gltf.scene);
  const corpo = new THREE.Group();
  corpo.matrixAutoUpdate = false;
  corpo.matrix.makeBasis(EIXO_X, EIXO_Y, EIXO_Z).invert().premultiply(new THREE.Matrix4().makeScale(1 / ALTURA_ARQUIVO, 1 / ALTURA_ARQUIVO, 1 / ALTURA_ARQUIVO));
  corpo.add(gltf.scene);
  const pivo = new THREE.Group(); pivo.add(corpo); cena.add(pivo);
  // Onde está a tela, medida no próprio modelo (vértice a vértice): centro, meia-largura,
  // meia-altura e a frente do vidro. O HTML é encaixado exatamente nesse retângulo.
  cena.updateMatrixWorld(true);
  const caixa = vidro && new THREE.Box3().setFromObject(vidro, true), meio = caixa?.getCenter(new THREE.Vector3());
  const tela = vidro ? { x: (caixa.max.x - caixa.min.x) / 2, y: (caixa.max.y - caixa.min.y) / 2, z: caixa.max.z, cx: meio.x, cy: meio.y } : { ...TELA, cx: 0, cy: 0 };

  // Câmera a 2 alturas do aparelho (a mesma perspectiva que o site já tinha). O campo de visão é
  // calculado para que a altura do aparelho na imagem seja exatamente a pedida.
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50); camera.position.z = 2;
  let L = 1, A = 1, px = 1; // tamanho do canvas e pixels por unidade do modelo
  function ajustar(largura, altura, alturaAparelho) {
    L = largura; A = altura; px = alturaAparelho;
    renderer.setSize(L, A, false);
    camera.aspect = L / A;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(A / (2 * camera.position.z * px)));
    camera.updateProjectionMatrix();
  }

  const v = new THREE.Vector3(), normal = new THREE.Vector3(), centro = new THREE.Vector3();
  const rad = Math.PI / 180;
  // pose em graus no sentido do CSS (y para baixo): por isso os sinais de rx e rz
  function quadro(pose, cx, cy) {
    pivo.position.set((cx - L / 2) / px, -(cy + pose.y - A / 2) / px, 0);
    pivo.scale.setScalar(pose.s);
    pivo.rotation.set(-pose.rx * rad, pose.ry * rad, -pose.rz * rad, "XYZ");
    pivo.updateMatrixWorld(true);
    renderer.render(cena, camera);
    // tela visível só enquanto está virada para a câmera
    normal.set(0, 0, 1).transformDirection(pivo.matrixWorld);
    centro.set(tela.cx, tela.cy, tela.z).applyMatrix4(pivo.matrixWorld);
    const de = camera.position.clone().sub(centro).normalize();
    return { frente: normal.dot(de) };
  }
  /* Transformação CSS que deita o bloco w×h da tela sobre o vidro do modelo. Usa a mesma câmera
     do three.js: perspectiva de 2 alturas (aplicada pelo app.js no palco) e a mesma ordem de
     rotações. Não usa matrix3d com divisão por w: o iOS/WebKit nem sempre respeita. */
  function css(w, h, pose, cx, cy) {
    const kx = 2 * tela.x * px / w, ky = 2 * tela.y * px / h;
    return `translate3d(${cx.toFixed(2)}px,${(cy + pose.y).toFixed(2)}px,0) scale(${pose.s}) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) translate3d(${(tela.cx * px).toFixed(2)}px,${(-tela.cy * px).toFixed(2)}px,${(tela.z * px).toFixed(2)}px) scale(${kx.toFixed(5)},${ky.toFixed(5)}) translate(${-w / 2}px,${-h / 2}px)`;
  }
  return { ajustar, quadro, css, tela };
}
