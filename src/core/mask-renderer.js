// Renderizador de Mscaras Geomtricas de Alta Preciso e Ajuste Proporcional de Capas (Object-Fit: Cover)

/**
 * Cria a funo de recorte (clipFunc) do Konva com encaixe milimtrico na geometria real do artefato
 * @param {string} type Tipo da pea: 'panel_round' | 'panel_arch' | 'cylinder' | 'generic'
 * @param {number} width Largura do elemento no canvas
 * @param {number} height Altura do elemento no canvas
 * @returns {Function} Funo de clip para Konva.Group
 */
export function createClipFunction(type, width, height) {
  if (type === 'panel_round') {
    // Painel Redondo: O aro circular fica centralizado no topo com os ps embaixo
    // Base SVG: viewBox 300 x 380 -> Aro: cx=150 (50%), cy=150 (39.47%), r=140 (46.67% da largura)
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (140 / 300) + 0.5; // +0.5px para cobrir 100% da borda base sem sobras

    return function(ctx) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'panel_arch') {
    // Arco Romano: Estrutura arqueada no topo e reta at a base dos ps
    // Base SVG: viewBox 200 x 380 -> x=20..180 (80% da largura), topo em y=20 (5.26%), base em y=370 (97.37%)
    const xLeft = width * (20 / 200);
    const xRight = width * (180 / 200);
    const cx = width * 0.5;
    const cy = height * (100 / 380);
    const r = width * (80 / 200) + 0.5;
    const yBottom = height * (370 / 380);

    return function(ctx) {
      ctx.beginPath();
      ctx.moveTo(xLeft, yBottom);
      ctx.lineTo(xLeft, cy);
      ctx.arc(cx, cy, r, Math.PI, 0, false);
      ctx.lineTo(xRight, yBottom);
      ctx.closePath();
    };
  }

  if (type === 'cylinder') {
    // Cilindro: Silhueta 2.5D com elipse superior, laterais retas e elipse inferior
    // Base SVG: viewBox 160 x 220 -> x=15..145, cyTop=35, cyBottom=195, rx=65, ry=20
    const xLeft = width * (15 / 160);
    const xRight = width * (145 / 160);
    const cx = width * 0.5;
    const rx = width * (65 / 160) + 0.5;
    const ry = height * (20 / 220) + 0.5;
    const yTop = height * (35 / 220);
    const yBottom = height * (195 / 220);

    return function(ctx) {
      ctx.beginPath();
      // Arco superior da elipse do topo (de xLeft a xRight)
      ctx.ellipse(cx, yTop, rx, ry, 0, Math.PI, 0, false);
      // Lateral direita descendo
      ctx.lineTo(xRight, yBottom);
      // Arco inferior da elipse da base (de xRight a xLeft)
      ctx.ellipse(cx, yBottom, rx, ry, 0, 0, Math.PI, false);
      // Lateral esquerda subindo
      ctx.lineTo(xLeft, yTop);
      ctx.closePath();
    };
  }

  // Padro retangular
  return function(ctx) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
  };
}

/**
 * Calcula o posicionamento e escala proporcional da estampa (Object-Fit: Cover)
 * garantindo que a imagem nunca seja deformada, achatada ou desalinhada do aro da pea.
 * @param {string} type Tipo da pea
 * @param {number} width Largura da pea no canvas
 * @param {number} height Altura da pea no canvas
 * @param {number} imgW Largura intrnseca da estampa
 * @param {number} imgH Altura intrnseca da estampa
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function calculateCoverPlacement(type, width, height, imgW, imgH) {
  let targetBox = { x: 0, y: 0, w: width, h: height, cx: width / 2, cy: height / 2 };

  if (type === 'panel_round') {
    // Caixa alvo: Exatamente o dimetro circular do aro
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const r = width * (140 / 300);
    targetBox = {
      x: cx - r,
      y: cy - r,
      w: r * 2,
      h: r * 2,
      cx: cx,
      cy: cy
    };
  } else if (type === 'panel_arch') {
    // Caixa alvo: O retngulo que envolve o arco do topo at a base
    const xLeft = width * (20 / 200);
    const archW = width * (160 / 200);
    const yTop = height * (20 / 380);
    const yBottom = height * (370 / 380);
    const archH = yBottom - yTop;
    targetBox = {
      x: xLeft,
      y: yTop,
      w: archW,
      h: archH,
      cx: xLeft + archW / 2,
      cy: yTop + archH / 2
    };
  } else if (type === 'cylinder') {
    // Caixa alvo: O corpo completo do cilindro
    const xLeft = width * (15 / 160);
    const cylW = width * (130 / 160);
    const ry = height * (20 / 220);
    const yTop = height * (35 / 220) - ry;
    const yBottom = height * (195 / 220) + ry;
    const cylH = yBottom - yTop;
    targetBox = {
      x: xLeft,
      y: yTop,
      w: cylW,
      h: cylH,
      cx: xLeft + cylW / 2,
      cy: yTop + cylH / 2
    };
  }

  // Aplica algoritmo 'object-fit: cover' centralizado
  const safeImgW = Math.max(1, imgW || targetBox.w);
  const safeImgH = Math.max(1, imgH || targetBox.h);

  const scale = Math.max(targetBox.w / safeImgW, targetBox.h / safeImgH);
  const finalW = safeImgW * scale;
  const finalH = safeImgH * scale;

  return {
    x: targetBox.cx - finalW / 2,
    y: targetBox.cy - finalH / 2,
    width: finalW,
    height: finalH
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
