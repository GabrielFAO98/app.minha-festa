// Renderizador de Máscaras Geométricas de Alta Precisão, Ajuste Proporcional (Object-Fit: Cover)
// e Camadas de Sombreamento 3D / Volume Realista para Capas e Estampas
import Konva from 'konva';

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
 * Cria a camada de sombreamento 3D realista (Shading & Volume Overlay)
 * Mantém luz, profundidade, reflexo de estúdio e sombra natural mesmo sobre estampas vestidas.
 * @param {string} type Tipo da peça
 * @param {number} width Largura do elemento no canvas
 * @param {number} height Altura do elemento no canvas
 * @returns {Konva.Shape|null}
 */
export function createShadingOverlay(type, width, height) {
  if (type === 'cylinder') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = width * 0.5;
    const rx = width * (65.5 / 160);
    const ry = height * (20.5 / 220);
    const yTop = height * (35 / 220);
    const yBottom = height * (195 / 220);

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Curvatura e volume cilíndrico horizontal (luz e sombra realista)
        const cylGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
        cylGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.30)');       // Sombra na curvatura esquerda
        cylGrad.addColorStop(0.12, 'rgba(0, 0, 0, 0.10)');      // Penumbra suave
        cylGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.22)'); // Destaque de luz especular frontal
        cylGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.04)'); // Luz difusa
        cylGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.08)');      // Início da sombra direita
        cylGrad.addColorStop(0.88, 'rgba(0, 0, 0, 0.24)');      // Sombra intermediária
        cylGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.36)');       // Sombra profunda na curva direita

        ctx.fillStyle = cylGrad;
        ctx.fillRect(cx - rx - 2, 0, (rx * 2) + 4, height);

        // 2. Sombra de vinco e oclusão sob a tampa superior
        ctx.beginPath();
        ctx.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI, false);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.lineWidth = Math.max(1.5, 2.5 * scaleY);
        ctx.stroke();

        // 3. Degradê de sombra suave caindo abaixo da tampa
        const dropLidGrad = ctx.createLinearGradient(0, yTop, 0, yTop + 24 * scaleY);
        dropLidGrad.addColorStop(0, 'rgba(0, 0, 0, 0.24)');
        dropLidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = dropLidGrad;
        ctx.beginPath();
        ctx.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI, false);
        ctx.lineTo(cx + rx, yTop + 24 * scaleY);
        ctx.lineTo(cx - rx, yTop + 24 * scaleY);
        ctx.closePath();
        ctx.fill();

        // 4. Luz na face superior (tampa recebe luz ambiente de cima)
        ctx.beginPath();
        ctx.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI * 2, false);
        const topGrad = ctx.createLinearGradient(0, yTop - ry, 0, yTop + ry);
        topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
        ctx.fillStyle = topGrad;
        ctx.fill();

        // 5. Sombra de contato com o chão na base inferior
        const baseGrad = ctx.createLinearGradient(0, yBottom - 12 * scaleY, 0, yBottom + ry);
        baseGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(cx - rx - 2, yBottom - 12 * scaleY, (rx * 2) + 4, ry + 20 * scaleY);
      }
    });
  }

  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Vinheta radial perimétrica (tensão e curvatura do tecido no aro metálico)
        const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius);
        radGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
        radGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.05)');
        radGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.16)');
        radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.30)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. Luz de estúdio direcional (suave iluminação superior e sombra inferior)
        const vertGrad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
        vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.12)');
        vertGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
        vertGrad.addColorStop(0.80, 'rgba(0, 0, 0, 0.04)');
        vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.15)');

        ctx.fillStyle = vertGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();

        // 3. Friso de borda sutil definindo o aro metálico
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  if (type === 'panel_arch') {
    const scaleX = width / 200;
    const scaleY = height / 380;
    const cx = 100 * scaleX;
    const cy = 100 * scaleY;
    const rx = 82 * scaleX;
    const ry = 82 * scaleY;
    const xLeft = cx - rx;
    const xRight = cx + rx;
    const yTop = cy - ry;
    const yBottom = 371.5 * scaleY;

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Sombreamento lateral nas bordas (profundidade de tecido tensionado)
        const horizGrad = ctx.createLinearGradient(xLeft, 0, xRight, 0);
        horizGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.20)');
        horizGrad.addColorStop(0.08, 'rgba(0, 0, 0, 0.05)');
        horizGrad.addColorStop(0.20, 'rgba(0, 0, 0, 0.0)');
        horizGrad.addColorStop(0.80, 'rgba(0, 0, 0, 0.0)');
        horizGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.05)');
        horizGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.20)');

        ctx.fillStyle = horizGrad;
        ctx.fillRect(xLeft, yTop, rx * 2, yBottom - yTop);

        // 2. Iluminação vertical (luz no arco do topo e sombra na base)
        const vertGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
        vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.14)');
        vertGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.0)');
        vertGrad.addColorStop(0.80, 'rgba(0, 0, 0, 0.04)');
        vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.18)');

        ctx.fillStyle = vertGrad;
        ctx.fillRect(xLeft, yTop, rx * 2, yBottom - yTop);

        // 3. Friso de borda sutil ao longo do arco
        ctx.beginPath();
        ctx.moveTo(xLeft + 1, yBottom);
        ctx.lineTo(xLeft + 1, cy);
        ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, Math.PI, 0, false);
        ctx.lineTo(xRight - 1, yBottom);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  if (type === 'rug_oval') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Perspectiva de chão (fundo com penumbra de distância, primeiro plano iluminado)
        const floorGrad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
        floorGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.22)');
        floorGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0.03)');
        floorGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.10)');

        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. Borda de costura do tapete
        const edgeGrad = ctx.createRadialGradient(cx, cy, rx * 0.7, cx, cy, rx);
        edgeGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
        edgeGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.05)');
        edgeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.20)');

        ctx.fillStyle = edgeGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx - 1, ry - 1, 0, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  if (type === 'rug_round') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Perspectiva suave de profundidade
        const floorGrad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
        floorGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.20)');
        floorGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
        floorGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.08)');

        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. Vinheta de costura na borda
        const edgeGrad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius);
        edgeGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
        edgeGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0.06)');
        edgeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.22)');

        ctx.fillStyle = edgeGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  if (type === 'rug_rect_3d') {
    const scaleX = width / 280;
    const scaleY = height / 140;
    const xBottomLeft = 9 * scaleX;
    const xTopLeft = 34 * scaleX;
    const xTopRight = 246 * scaleX;
    const xBottomRight = 271 * scaleX;
    const yTop = 14 * scaleY;
    const yBottom = 126 * scaleY;

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Profundidade de chão perspectiva 3D
        const depthGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
        depthGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.24)');
        depthGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0.03)');
        depthGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.12)');

        ctx.fillStyle = depthGrad;
        ctx.beginPath();
        ctx.moveTo(xBottomLeft, yBottom);
        ctx.lineTo(xTopLeft, yTop);
        ctx.lineTo(xTopRight, yTop);
        ctx.lineTo(xBottomRight, yBottom);
        ctx.closePath();
        ctx.fill();

        // 2. Contorno de costura dupla em perspectiva
        ctx.beginPath();
        ctx.moveTo(xBottomLeft + 1, yBottom - 1);
        ctx.lineTo(xTopLeft + 1, yTop + 1);
        ctx.lineTo(xTopRight - 1, yTop + 1);
        ctx.lineTo(xBottomRight - 1, yBottom - 1);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.20)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  // Padrão suave para outros itens
  return new Konva.Shape({
    name: 'shading-overlay',
    listening: false,
    sceneFunc: (context) => {
      const ctx = context._context;
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0.0, 'rgba(255, 255, 255, 0.06)');
      vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.0)');
      vignette.addColorStop(1.0, 'rgba(0, 0, 0, 0.14)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }
  });
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
