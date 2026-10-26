// Versão simplificada da trava de saída de um atendente de IA.
// A IA escreve; este código decide o que pode ir para o cliente.
const LINKS_OFICIAIS = [
  'https://pay.hotmart.com/PRODUTO-A',
  'https://pay.hotmart.com/PRODUTO-B',
];
const DOMINIOS_VIGIADOS = /hotmart\.com/i;
const RESPOSTA_SEGURA = 'Vou confirmar essa informação com a equipe e já te retorno.';

function travarSaida(texto) {
  const limpo = texto
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1: $2') // link markdown vira texto
    .replace(/\*\*/g, '*'); // negrito do WhatsApp usa um asterisco
  const urls = limpo.match(/https?:\/\/[^\s)]+/g) || [];
  const bloqueadas = urls.filter(u => DOMINIOS_VIGIADOS.test(u) && !LINKS_OFICIAIS.includes(u.replace(/[.,;!?]+$/, '')));
  return bloqueadas.length
    ? { texto: RESPOSTA_SEGURA, bloqueadas }
    : { texto: limpo, bloqueadas };
}
