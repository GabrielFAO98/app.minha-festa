// Renderizador de Máscaras Geométricas de Alta Precisão e Ajuste Proporcional de Capas (Object-Fit: Cover)

/**
 * Cria a função de recorte (clipFunc) do Konva com encaixe milimétrico na geometria real do artefato
 * @param {string} type Tipo da peça: 'panel_round' | 'panel_arch' | 'cylinder' | 'rug_oval' | 'rug_round' | 'rug_rect_3d' | 'generic'
 * @param {number} width Largura do elemento no canvas
 * @param {number} height Altura do elemento no canvas
 * @returns {Function} Função de clip para Konva.Group
 */
export function createClipFunction(type, width, height) {
  if (type === 'panel_round') {
    // Painel Redondo: O aro circular fica centralizado no topo com os pés embaixo
    // Base SVG: viewBox 300 x 380 -> Aro: cx=150 (50%), cy=150 (39.47%), r=140 + stroke 2 = 142
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);

    return function(ctx) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'panel_arch') {
    // Arco Romano: Base SVG viewBox 200 x 380
    // Estrutura em arco elíptico perfeito no topo e laterais retas até a base dos pés
    const scaleX = width / 200;
    const scaleY = height / 380;
    const cx = 100 * scaleX;
    const cy = 100 * scaleY;
    const rx = 82 * scaleX;
    const ry = 82 * scaleY;
    const xLeft = cx - rx;
    const xRight = cx + rx;
    const yBottom = 371.5 * scaleY;

    return function(ctx) {
      ctx.beginPath();
      ctx.moveTo(xLeft, yBottom);
      ctx.lineTo(xLeft, cy);
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, false);
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
    const rx = width * (65.5 / 160);
    const ry = height * (20.5 / 220);
    const yTop = height * (35 / 220);
    const yBottom = height * (195 / 220);

    return function(ctx) {
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rx, ry, 0, Math.PI, 0, false);
      ctx.lineTo(xRight, yBottom);
      ctx.ellipse(cx, yBottom, rx, ry, 0, 0, Math.PI, false);
      ctx.lineTo(xLeft, yTop);
      ctx.closePath();
    };
  }

  if (type === 'rug_oval') {
    // Tapete Oval / Elíptico em Perspectiva de Chão (viewBox 280 x 120)
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);

    return function(ctx) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_round') {
    // Tapete Completamente Redondo (viewBox 260 x 260, proporção 1:1)
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);

    return function(ctx) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_rect_3d') {
    // Tapete Retangular em Perspectiva 3D de Piso (viewBox 280 x 140)
    const scaleX = width / 280;
    const scaleY = height / 140;
    const xBottomLeft = 9 * scaleX;
    const xTopLeft = 34 * scaleX;
    const xTopRight = 246 * scaleX;
    const xBottomRight = 271 * scaleX;
    const yTop = 14 * scaleY;
    const yBottom = 126 * scaleY;

    return function(ctx) {
      ctx.beginPath();
      ctx.moveTo(xBottomLeft, yBottom);
      ctx.lineTo(xTopLeft, yTop);
      ctx.lineTo(xTopRight, yTop);
      ctx.lineTo(xBottomRight, yBottom);
      ctx.closePath();
    };
  }

  // Padrão retangular
  return function(ctx) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
  };
}

/**
 * Calcula o posicionamento e escala proporcional da estampa (Object-Fit: Cover)
 * garantindo que a imagem nunca seja deformada, achatada ou desalinhada da face da peça.
 * @param {string} type Tipo da peça
 * @param {number} width Largura da peça no canvas
 * @param {number} height Altura da peça no canvas
 * @param {number} imgW Largura intrínseca da estampa
 * @param {number} imgH Altura intrínseca da estampa
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function calculateCoverPlacement(type, width, height, imgW, imgH) {
  let targetBox = { x: 0, y: 0, w: width, h: height, cx: width / 2, cy: height / 2 };

  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const r = width * (142 / 300);
    targetBox = {
      x: cx - r,
      y: cy - r,
      w: r * 2,
      h: r * 2,
      cx: cx,
      cy: cy
    };
  } else if (type === 'panel_arch') {
    const scaleX = width / 200;
    const scaleY = height / 380;
    const cx = 100 * scaleX;
    const rx = 82 * scaleX;
    const ry = 82 * scaleY;
    const xLeft = cx - rx;
    const archW = rx * 2;
    const yTop = 100 * scaleY - ry;
    const yBottom = 371.5 * scaleY;
    const archH = yBottom - yTop;

    targetBox = {
      x: xLeft,
      y: yTop,
      w: archW,
      h: archH,
      cx: cx,
      cy: yTop + archH / 2
    };
  } else if (type === 'cylinder') {
    const xLeft = width * (15 / 160);
    const cylW = width * (130 / 160);
    const ry = height * (20.5 / 220);
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
  } else if (type === 'rug_oval') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);
    targetBox = {
      x: cx - rx,
      y: cy - ry,
      w: rx * 2,
      h: ry * 2,
      cx: cx,
      cy: cy
    };
  } else if (type === 'rug_round') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);
    targetBox = {
      x: cx - radius,
      y: cy - radius,
      w: radius * 2,
      h: radius * 2,
      cx: cx,
      cy: cy
    };
  } else if (type === 'rug_rect_3d') {
    const scaleX = width / 280;
    const scaleY = height / 140;
    const xLeft = 9 * scaleX;
    const xRight = 271 * scaleX;
    const yTop = 14 * scaleY;
    const yBottom = 126 * scaleY;
    const rectW = xRight - xLeft;
    const rectH = yBottom - yTop;

    targetBox = {
      x: xLeft,
      y: yTop,
      w: rectW,
      h: rectH,
      cx: xLeft + rectW / 2,
      cy: yTop + rectH / 2
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
 * Verifica se uma coordenada local (x, y) está dentro da área visível/opaca do artefato
 * @param {string} type Tipo da peça: 'panel_round' | 'panel_arch' | 'cylinder' | 'rug_oval' | 'rug_round' | 'rug_rect_3d' | 'generic'
 * @param {number} x Coordenada X local no grupo
 * @param {number} y Coordenada Y local no grupo
 * @param {number} width Largura do elemento no canvas
 * @param {number} height Altura do elemento no canvas
 * @returns {boolean}
 */
export function isPointInsideMask(type, x, y, width, height) {
  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);
    const dx = x - cx;
    const dy = y - cy;
    if ((dx * dx + dy * dy) <= (radius * radius)) return true;

    // Pernas do suporte de ferro do painel redondo (se clicado na base)
    const legTop = cy + radius;
    const legBottom = height * (370 / 380);
    if (y >= legTop && y <= legBottom) {
      const legLeft = width * (60 / 300);
      const legRight = width * (240 / 300);
      return x >= legLeft && x <= legRight;
    }
    return false;
  }

  if (type === 'panel_arch') {
    const scaleX = width / 200;
    const scaleY = height / 380;
    const cx = 100 * scaleX;
    const cy = 100 * scaleY;
    const rx = 82 * scaleX;
    const ry = 82 * scaleY;
    const yBottom = 371.5 * scaleY;

    if (y < (cy - ry) || y > yBottom) return false;
    if (x < (cx - rx) || x > (cx + rx)) return false;
    if (y >= cy) return true;
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return (dx * dx + dy * dy) <= 1.0;
  }

  if (type === 'cylinder') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = 80 * scaleX;
    const rx = 65.5 * scaleX;
    const ry = 20.5 * scaleY;
    const yTop = 35 * scaleY;
    const yBottom = 195 * scaleY;

    if (x < (cx - rx) || x > (cx + rx)) return false;
    if (y < (yTop - ry) || y > (yBottom + ry)) return false;
    if (y >= yTop && y <= yBottom) return true;
    if (y < yTop) {
      const dx = (x - cx) / rx;
      const dy = (y - yTop) / ry;
      return (dx * dx + dy * dy) <= 1.0;
    }
    if (y > yBottom) {
      const dx = (x - cx) / rx;
      const dy = (y - yBottom) / ry;
      return (dx * dx + dy * dy) <= 1.0;
    }
    return false;
  }

  if (type === 'rug_oval') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return (dx * dx + dy * dy) <= 1.0;
  }

  if (type === 'rug_round') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
  }

  if (type === 'rug_rect_3d') {
    const scaleX = width / 280;
    const scaleY = height / 140;
    const yTop = 14 * scaleY;
    const yBottom = 126 * scaleY;

    if (y < yTop || y > yBottom) return false;

    const t = (y - yTop) / (yBottom - yTop);
    const curLeft = (34 + (9 - 34) * t) * scaleX;
    const curRight = (246 + (271 - 246) * t) * scaleX;
    return x >= curLeft && x <= curRight;
  }

  return x >= 0 && x <= width && y >= 0 && y <= height;
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
