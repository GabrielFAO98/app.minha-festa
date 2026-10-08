// Renderizador e gerenciador de máscaras para Painéis e Cilindros no Konva

/**
 * Cria a função de recorte (clipFunc) do Konva adequada para o tipo de elemento
 * @param {string} type Tipo da peça: 'panel_round' | 'panel_arch' | 'cylinder' | 'generic'
 * @param {number} width Largura do elemento no canvas
 * @param {number} height Altura do elemento no canvas
 * @returns {Function} Função de clip para Konva.Group
 */
export function createClipFunction(type, width, height) {
  if (type === 'panel_round') {
    // Máscara perfeitamente circular centralizada
    const radius = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height * 0.42; // Centro do aro no painel com pés
    return function(ctx) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.92, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'panel_arch') {
    // Máscara com topo arredondado (arco romano) e corpo reto
    const w = width * 0.88;
    const x = (width - w) / 2;
    const r = w / 2;
    const yTop = height * 0.05;
    const yBottom = height * 0.95;

    return function(ctx) {
      ctx.beginPath();
      ctx.moveTo(x, yBottom);
      ctx.lineTo(x, yTop + r);
      ctx.arc(x + r, yTop + r, r, Math.PI, 0, false);
      ctx.lineTo(x + w, yBottom);
      ctx.closePath();
    };
  }

  if (type === 'cylinder') {
    // Máscara com formato cilíndrico (topo arredondado, corpo reto e fundo arredondado)
    const w = width * 0.88;
    const x = (width - w) / 2;
    const ry = height * 0.1;
    const yTop = height * 0.16;
    const yBottom = height * 0.9;

    return function(ctx) {
      ctx.beginPath();
      // Borda lateral esquerda
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yBottom);
      // Arco inferior
      ctx.ellipse(x + w / 2, yBottom, w / 2, ry, 0, Math.PI, 0, true);
      // Borda lateral direita
      ctx.lineTo(x + w, yTop);
      // Arco superior
      ctx.ellipse(x + w / 2, yTop, w / 2, ry, 0, 0, Math.PI, true);
      ctx.closePath();
    };
  }

  // Padrão retangular suave
  return function(ctx) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
  };
}

/**
 * Carrega uma imagem a partir de uma URL ou DataURI assincronamente
 * @param {string} src URL da imagem
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
