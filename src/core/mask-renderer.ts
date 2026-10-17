import Konva from 'konva';

/**
 * Cria a função de recorte (clipFunc) no contexto 2D do Canvas Konva
 * para vestir capas e cores sólidas sobre toda a estrutura, sem contornos.
 */
export function createClipFunction(type: string, width: number, height: number) {
  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);

    return function (ctx: any) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
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
    const yBottom = 368 * scaleY;

    return function (ctx: any) {
      ctx.beginPath();
      ctx.moveTo(xLeft, yBottom);
      ctx.lineTo(xLeft, cy);
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, false);
      ctx.lineTo(xRight, yBottom);
      ctx.closePath();
    };
  }

  if (type === 'cylinder') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = width * 0.5;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
    const xLeft = cx - rx;
    const xRight = cx + rx;
    const yTop = 35 * scaleY;
    const yBottom = 195 * scaleY;

    return function (ctx: any) {
      ctx.beginPath();
      ctx.ellipse(cx, yTop, rx, ry, 0, Math.PI, 0, false);
      ctx.lineTo(xRight, yBottom);
      ctx.ellipse(cx, yBottom, rx, ry, 0, 0, Math.PI, false);
      ctx.lineTo(xLeft, yTop);
      ctx.closePath();
    };
  }

  if (type === 'rug_oval') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);

    return function (ctx: any) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_round') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);

    return function (ctx: any) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
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

    return function (ctx: any) {
      ctx.beginPath();
      ctx.moveTo(xBottomLeft, yBottom);
      ctx.lineTo(xTopLeft, yTop);
      ctx.lineTo(xTopRight, yTop);
      ctx.lineTo(xBottomRight, yBottom);
      ctx.closePath();
    };
  }

  if (type === 'panel_rect') {
    const scaleX = width / 300;
    const scaleY = height / 260;
    const x = 15 * scaleX;
    const y = 15 * scaleY;
    const w = 270 * scaleX;
    const h = 215 * scaleY;

    return function (ctx: any) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
    };
  }

  if (type === 'panel_half_moon') {
    const scaleX = width / 220;
    const scaleY = height / 380;
    const xLeft = 20 * scaleX;
    const xRight = 200 * scaleX;
    const yBottom = 352 * scaleY;

    return function (ctx: any) {
      ctx.beginPath();
      ctx.moveTo(xLeft, yBottom);
      ctx.lineTo(xLeft, 150 * scaleY);
      ctx.bezierCurveTo(xLeft, 35 * scaleY, 110 * scaleX, 20 * scaleY, xRight, 25 * scaleY);
      ctx.lineTo(xRight, yBottom);
      ctx.closePath();
    };
  }

  if (type === 'cube') {
    const scaleX = width / 160;
    const scaleY = height / 235;
    return function (ctx: any) {
      ctx.beginPath();
      ctx.moveTo(80 * scaleX, 18 * scaleY);
      ctx.lineTo(145 * scaleX, 38 * scaleY);
      ctx.lineTo(145 * scaleX, 205 * scaleY);
      ctx.lineTo(80 * scaleX, 225 * scaleY);
      ctx.lineTo(15 * scaleX, 205 * scaleY);
      ctx.lineTo(15 * scaleX, 38 * scaleY);
      ctx.closePath();
    };
  }

  return function (ctx: any) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
  };
}

/**
 * Calcula o posicionamento, escala (zoom) e deslocamento (pan/arrasto estilo Facebook) da capa
 * dentro da máscara da estrutura SVG.
 */
export function calculateCoverPlacement(
  type: string,
  width: number,
  height: number,
  imgW: number,
  imgH: number,
  coverScale: number = 1,
  coverOffsetX: number = 0,
  coverOffsetY: number = 0
) {
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
    const yBottom = 368 * scaleY;
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
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = width * 0.5;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
    const xLeft = cx - rx;
    const cylW = rx * 2;
    const yTop = (35 * scaleY) - ry;
    const yBottom = (195 * scaleY) + ry;
    const cylH = yBottom - yTop;
    targetBox = {
      x: xLeft,
      y: yTop,
      w: cylW,
      h: cylH,
      cx: cx,
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
  } else if (type === 'panel_rect') {
    const scaleX = width / 300;
    const scaleY = height / 260;
    targetBox = {
      x: 15 * scaleX,
      y: 15 * scaleY,
      w: 270 * scaleX,
      h: 215 * scaleY,
      cx: 150 * scaleX,
      cy: 122.5 * scaleY
    };
  } else if (type === 'panel_half_moon') {
    const scaleX = width / 220;
    const scaleY = height / 380;
    targetBox = {
      x: 20 * scaleX,
      y: 20 * scaleY,
      w: 180 * scaleX,
      h: 332 * scaleY,
      cx: 110 * scaleX,
      cy: 186 * scaleY
    };
  } else if (type === 'cube') {
    const scaleX = width / 160;
    const scaleY = height / 235;
    targetBox = {
      x: 15 * scaleX,
      y: 18 * scaleY,
      w: 130 * scaleX,
      h: 207 * scaleY,
      cx: 80 * scaleX,
      cy: 121.5 * scaleY
    };
  }

  const safeImgW = Math.max(1, imgW || targetBox.w);
  const safeImgH = Math.max(1, imgH || targetBox.h);

  const baseScale = Math.max(targetBox.w / safeImgW, targetBox.h / safeImgH);
  const effectiveScale = baseScale * Math.max(0.35, Math.min(4.0, coverScale || 1));

  const finalW = safeImgW * effectiveScale;
  const finalH = safeImgH * effectiveScale;

  return {
    x: (targetBox.cx - finalW / 2) + (coverOffsetX || 0),
    y: (targetBox.cy - finalH / 2) + (coverOffsetY || 0),
    width: finalW,
    height: finalH,
    targetBox
  };
}

/**
 * Cria a camada de sombreamento 3D realista sobre capas e pinturas sólidas,
 * estritamente SEM BORDAS / SEM CONTORNOS para que a capa cubra toda a estrutura.
 */
export function createShadingOverlay(type: string, width: number, height: number) {
  if (type === 'cylinder') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = width * 0.5;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
    const yTop = 35 * scaleY;
    const yBottom = 195 * scaleY;

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        // 1. Curvatura cilíndrica horizontal suave sem contorno
        const cylGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
        cylGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.22)');
        cylGrad.addColorStop(0.16, 'rgba(0, 0, 0, 0.04)');
        cylGrad.addColorStop(0.30, 'rgba(255, 255, 255, 0.16)');
        cylGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.02)');
        cylGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.12)');
        cylGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.26)');

        ctx.fillStyle = cylGrad;
        ctx.fillRect(cx - rx, yTop - ry, rx * 2, yBottom - yTop + (ry * 2));

        // 2. Face do tampo superior iluminada (sem stroke/borda)
        ctx.beginPath();
        ctx.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI * 2, false);
        const topGrad = ctx.createLinearGradient(0, yTop - ry, 0, yTop + ry);
        topGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.15)');
        topGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.03)');
        ctx.fillStyle = topGrad;
        ctx.fill();

        // 3. Sombra suave de contato na base inferior
        const baseGrad = ctx.createLinearGradient(0, yBottom - 6 * scaleY, 0, yBottom + ry);
        baseGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(cx - rx, yBottom - 6 * scaleY, rx * 2, ry + 8 * scaleY);
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

        // Iluminação suave de estúdio sem nenhuma borda ou contorno
        const vertGrad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
        vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
        vertGrad.addColorStop(0.50, 'rgba(255, 255, 255, 0.0)');
        vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

        ctx.fillStyle = vertGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
        ctx.fill();
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
    const yTop = cy - ry;
    const yBottom = 368 * scaleY;

    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;

        const vertGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
        vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
        vertGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
        vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

        ctx.fillStyle = vertGrad;
        ctx.fillRect(xLeft, yTop, rx * 2, yBottom - yTop);
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
        const floorGrad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
        floorGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.14)');
        floorGrad.addColorStop(0.50, 'rgba(0, 0, 0, 0.0)');
        floorGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.08)');

        ctx.fillStyle = floorGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
        ctx.fill();
      }
    });
  }

  if (type === 'cube') {
    const scaleX = width / 160;
    const scaleY = height / 235;
    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;
        // 1. Faceta do topo (iluminação superior)
        ctx.beginPath();
        ctx.moveTo(80 * scaleX, 18 * scaleY);
        ctx.lineTo(145 * scaleX, 38 * scaleY);
        ctx.lineTo(80 * scaleX, 58 * scaleY);
        ctx.lineTo(15 * scaleX, 38 * scaleY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();

        // 2. Face esquerda em sombra suave
        ctx.beginPath();
        ctx.moveTo(15 * scaleX, 38 * scaleY);
        ctx.lineTo(80 * scaleX, 58 * scaleY);
        ctx.lineTo(80 * scaleX, 225 * scaleY);
        ctx.lineTo(15 * scaleX, 205 * scaleY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fill();

        // 3. Face direita em luz direta
        ctx.beginPath();
        ctx.moveTo(80 * scaleX, 58 * scaleY);
        ctx.lineTo(145 * scaleX, 38 * scaleY);
        ctx.lineTo(145 * scaleX, 205 * scaleY);
        ctx.lineTo(80 * scaleX, 225 * scaleY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fill();
      }
    });
  }

  if (type === 'panel_rect') {
    const scaleX = width / 300;
    const scaleY = height / 260;
    const x = 15 * scaleX;
    const y = 15 * scaleY;
    const w = 270 * scaleX;
    const h = 215 * scaleY;
    return new Konva.Shape({
      name: 'shading-overlay',
      listening: false,
      sceneFunc: (context) => {
        const ctx = context._context;
        const vertGrad = ctx.createLinearGradient(0, y, 0, y + h);
        vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
        vertGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
        vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');
        ctx.fillStyle = vertGrad;
        ctx.fillRect(x, y, w, h);
      }
    });
  }

  return new Konva.Shape({
    name: 'shading-overlay',
    listening: false,
    sceneFunc: (context) => {
      const ctx = context._context;
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0.0, 'rgba(255, 255, 255, 0.05)');
      vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.0)');
      vignette.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }
  });
}

/**
 * Cria a sombra projetada de chão/tapete para cilindros
 */
export function createCylinderFloorShadow(width: number, height: number) {
  const scaleX = width / 160;
  const scaleY = height / 220;
  const cx = width * 0.5;
  const rxShadow = (65.5 * scaleX) * 1.12;
  const ryShadow = (12.5 * scaleY) * 1.45;
  const cyShadow = (195 * scaleY) + (12.5 * scaleY * 0.35);

  return new Konva.Shape({
    name: 'cylinder-floor-shadow',
    listening: false,
    sceneFunc: (context) => {
      const ctx = context._context;
      ctx.save();
      ctx.translate(cx, cyShadow);
      ctx.scale(1.0, ryShadow / rxShadow);
      const radGrad = ctx.createRadialGradient(0, 0, rxShadow * 0.2, 0, 0, rxShadow);
      radGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.40)');
      radGrad.addColorStop(0.40, 'rgba(0, 0, 0, 0.22)');
      radGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.07)');
      radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, rxShadow, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    }
  });
}

/**
 * Verifica se uma coordenada local (x, y) está dentro da área visível/opaca do artefato
 */
export function isPointInsideMask(type: string, x: number, y: number, width: number, height: number) {
  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);
    const dx = x - cx;
    const dy = y - cy;
    if ((dx * dx + dy * dy) <= (radius * radius)) return true;

    const legTop = cy + radius * 0.85;
    const legBottom = height * (372 / 380);
    if (y >= legTop && y <= legBottom) {
      const legLeft = width * (75 / 300);
      const legRight = width * (225 / 300);
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
    const yBottom = 374 * scaleY;

    if (y < (cy - ry) || y > yBottom) return false;
    if (x < (cx - rx) || x > (cx + rx)) return false;
    if (y >= cy) return true;
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return (dx * dx + dy * dy) <= 1.0;
  }

  if (type === 'cylinder' || type === 'cylinder_fluted') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = 80 * scaleX;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
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
 */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
