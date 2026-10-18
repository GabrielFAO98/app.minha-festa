import Konva from 'konva';

// Cache em memória de imagens e SVGs pré-rasterizados em GPU Bitmap
const imageBitmapCache = new Map<string, HTMLImageElement | HTMLCanvasElement>();

/**
 * Gera a função de recorte (clipFunc) do Konva baseada no formato geométrico da peça.
 * As coordenadas são proporcionais à largura (width) e altura (height) do nó no palco.
 */
export function createClipFunction(type: string, width: number, height: number) {
  if (type === 'panel_round') {
    const cx = width * 0.5;
    const cy = height * (150 / 380);
    const radius = width * (142 / 300);

    return (ctx: any) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'panel_arch') {
    const scaleX = width / 200;
    const scaleY = height / 380;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(18 * scaleX, 368 * scaleY);
      ctx.lineTo(18 * scaleX, 100 * scaleY);
      ctx.ellipse(100 * scaleX, 100 * scaleY, 82 * scaleX, 82 * scaleY, 0, Math.PI, 0, false);
      ctx.lineTo(182 * scaleX, 368 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'panel_half_moon') {
    const scaleX = width / 220;
    const scaleY = height / 380;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(20 * scaleX, 352 * scaleY);
      ctx.lineTo(20 * scaleX, 150 * scaleY);
      ctx.bezierCurveTo(
        20 * scaleX, 35 * scaleY,
        110 * scaleX, 20 * scaleY,
        200 * scaleX, 25 * scaleY
      );
      ctx.lineTo(200 * scaleX, 352 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'cylinder' || type === 'cylinder_fluted') {
    const scaleX = width / 160;
    const scaleY = height / 220;
    const cx = 80 * scaleX;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
    const yTop = 35 * scaleY;
    const yBottom = 195 * scaleY;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(cx - rx, yTop);
      ctx.ellipse(cx, yTop, rx, ry, 0, Math.PI, 0, false);
      ctx.lineTo(cx + rx, yBottom);
      ctx.ellipse(cx, yBottom, rx, ry, 0, 0, Math.PI, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_oval') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * (133 / 280);
    const ry = height * (53 / 120);

    return (ctx: any) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_round') {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const radius = Math.min(width, height) * (127 / 260);

    return (ctx: any) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
      ctx.closePath();
    };
  }

  if (type === 'rug_rect_3d') {
    const scaleX = width / 280;
    const scaleY = height / 140;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(34 * scaleX, 14 * scaleY);
      ctx.lineTo(246 * scaleX, 14 * scaleY);
      ctx.lineTo(271 * scaleX, 126 * scaleY);
      ctx.lineTo(9 * scaleX, 126 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'cube') {
    const scaleX = width / 160;
    const scaleY = height / 235;

    return (ctx: any) => {
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

  if (type === 'panel_rect') {
    const scaleX = width / 300;
    const scaleY = height / 260;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.rect(15 * scaleX, 15 * scaleY, 270 * scaleX, 215 * scaleY);
      ctx.closePath();
    };
  }

  return (ctx: any) => {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
  };
}

/**
 * Calcula o posicionamento e escala (object-fit: cover + zoom/pan estilo Facebook)
 * para que a imagem da capa preencha exatamente a área útil da peça
 */
export function calculateCoverPlacement(
  type: string,
  nodeWidth: number,
  nodeHeight: number,
  imgWidth: number,
  imgHeight: number,
  customScale: number = 1,
  offsetX: number = 0,
  offsetY: number = 0
) {
  let targetX = 0;
  let targetY = 0;
  let targetW = nodeWidth;
  let targetH = nodeHeight;

  if (type === 'panel_round') {
    const diameter = nodeWidth * (284 / 300);
    targetW = diameter;
    targetH = diameter;
    targetX = (nodeWidth - diameter) / 2;
    targetY = nodeHeight * (150 / 380) - diameter / 2;
  } else if (type === 'panel_arch') {
    targetX = nodeWidth * (18 / 200);
    targetY = nodeHeight * (18 / 380);
    targetW = nodeWidth * (164 / 200);
    targetH = nodeHeight * (350 / 380);
  } else if (type === 'panel_half_moon') {
    targetX = nodeWidth * (20 / 220);
    targetY = nodeHeight * (20 / 380);
    targetW = nodeWidth * (180 / 220);
    targetH = nodeHeight * (332 / 380);
  } else if (type === 'cylinder' || type === 'cylinder_fluted') {
    targetX = nodeWidth * (14.5 / 160);
    targetY = nodeHeight * (22.5 / 220);
    targetW = nodeWidth * (131 / 160);
    targetH = nodeHeight * (185 / 220);
  } else if (type === 'cube') {
    targetX = nodeWidth * (15 / 160);
    targetY = nodeHeight * (18 / 235);
    targetW = nodeWidth * (130 / 160);
    targetH = nodeHeight * (207 / 235);
  } else if (type === 'panel_rect') {
    targetX = nodeWidth * (15 / 300);
    targetY = nodeHeight * (15 / 260);
    targetW = nodeWidth * (270 / 300);
    targetH = nodeHeight * (215 / 260);
  }

  const baseScale = Math.max(targetW / (imgWidth || 1), targetH / (imgHeight || 1));
  const finalScale = baseScale * Math.max(0.35, Math.min(3.5, customScale || 1));
  const scaledW = imgWidth * finalScale;
  const scaledH = imgHeight * finalScale;

  return {
    x: targetX + (targetW - scaledW) / 2 + (offsetX || 0),
    y: targetY + (targetH - scaledH) / 2 + (offsetY || 0),
    width: scaledW,
    height: scaledH
  };
}

/**
 * Cria uma camada pré-renderizada de sombreamento volumétrico (sem bordas/contornos)
 * em um Canvas Offscreen para zero custo de CPU/GPU durante o arraste (60fps).
 */
export function createShadingOverlay(type: string, width: number, height: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (!ctx) {
    return new Konva.Shape({ name: 'shading-overlay', listening: false });
  }

  if (type === 'cylinder' || type === 'cylinder_fluted') {
    const scaleX = w / 160;
    const scaleY = h / 220;
    const cx = 80 * scaleX;
    const rx = 65.5 * scaleX;
    const ry = 12.5 * scaleY;
    const yTop = 35 * scaleY;
    const yBottom = 195 * scaleY;
    const xLeft = cx - rx;
    const xRight = cx + rx;

    const bodyGrad = ctx.createLinearGradient(xLeft, 0, xRight, 0);
    bodyGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.24)');
    bodyGrad.addColorStop(0.14, 'rgba(0, 0, 0, 0.06)');
    bodyGrad.addColorStop(0.34, 'rgba(255, 255, 255, 0.14)');
    bodyGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
    bodyGrad.addColorStop(0.84, 'rgba(0, 0, 0, 0.14)');
    bodyGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.32)');

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(xLeft, yTop - ry, rx * 2, (yBottom - yTop) + ry * 2);

    const topGrad = ctx.createLinearGradient(cx, yTop - ry, cx, yTop + ry);
    topGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.25)');
    topGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    topGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.12)');

    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI * 2, false);
    ctx.fill();
  } else if (type === 'panel_round') {
    const cx = w * 0.5;
    const cy = h * (150 / 380);
    const radius = w * (142 / 300);

    const radGrad = ctx.createRadialGradient(
      cx - radius * 0.2,
      cy - radius * 0.2,
      radius * 0.15,
      cx,
      cy,
      radius
    );
    radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
    radGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.0)');
    radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.12)');

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, false);
    ctx.fill();
  } else if (type === 'panel_arch') {
    const scaleX = w / 200;
    const scaleY = h / 380;
    const cx = 100 * scaleX;
    const rx = 82 * scaleX;
    const xLeft = cx - rx;
    const yTop = 18 * scaleY;
    const yBottom = 368 * scaleY;

    const vertGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
    vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
    vertGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
    vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

    ctx.fillStyle = vertGrad;
    ctx.fillRect(xLeft, yTop, rx * 2, yBottom - yTop);
  } else if (type === 'panel_half_moon') {
    const scaleX = w / 220;
    const scaleY = h / 380;
    const xLeft = 20 * scaleX;
    const yTop = 20 * scaleY;
    const yBottom = 352 * scaleY;

    const vertGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
    vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
    vertGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
    vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

    ctx.fillStyle = vertGrad;
    ctx.fillRect(xLeft, yTop, 180 * scaleX, yBottom - yTop);
  } else if (type === 'rug_oval') {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const rx = w * (133 / 280);
    const ry = h * (53 / 120);

    const floorGrad = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
    floorGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.14)');
    floorGrad.addColorStop(0.50, 'rgba(0, 0, 0, 0.0)');
    floorGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.08)');

    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
    ctx.fill();
  } else if (type === 'cube') {
    const scaleX = w / 160;
    const scaleY = h / 235;

    ctx.beginPath();
    ctx.moveTo(80 * scaleX, 18 * scaleY);
    ctx.lineTo(145 * scaleX, 38 * scaleY);
    ctx.lineTo(80 * scaleX, 58 * scaleY);
    ctx.lineTo(15 * scaleX, 38 * scaleY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(15 * scaleX, 38 * scaleY);
    ctx.lineTo(80 * scaleX, 58 * scaleY);
    ctx.lineTo(80 * scaleX, 225 * scaleY);
    ctx.lineTo(15 * scaleX, 205 * scaleY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(80 * scaleX, 58 * scaleY);
    ctx.lineTo(145 * scaleX, 38 * scaleY);
    ctx.lineTo(145 * scaleX, 205 * scaleY);
    ctx.lineTo(80 * scaleX, 225 * scaleY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();
  } else if (type === 'panel_rect') {
    const scaleX = w / 300;
    const scaleY = h / 260;
    const x = 15 * scaleX;
    const y = 15 * scaleY;
    const rectW = 270 * scaleX;
    const rectH = 215 * scaleY;

    const vertGrad = ctx.createLinearGradient(0, y, 0, y + rectH);
    vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
    vertGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
    vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');
    ctx.fillStyle = vertGrad;
    ctx.fillRect(x, y, rectW, rectH);
  } else {
    const vignette = ctx.createLinearGradient(0, 0, 0, h);
    vignette.addColorStop(0.0, 'rgba(255, 255, 255, 0.05)');
    vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.0)');
    vignette.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  return new Konva.Image({
    name: 'shading-overlay',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
  });
}

/**
 * Cria a sombra projetada de chão/tapete para cilindros pré-renderizada em Canvas Offscreen
 */
export function createCylinderFloorShadow(width: number, height: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (ctx) {
    const scaleX = w / 160;
    const scaleY = h / 220;
    const cx = w * 0.5;
    const rxShadow = (65.5 * scaleX) * 1.12;
    const ryShadow = (12.5 * scaleY) * 1.45;
    const cyShadow = (195 * scaleY) + (12.5 * scaleY * 0.35);

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

  return new Konva.Image({
    name: 'cylinder-floor-shadow',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
  });
}

/**
 * Cria os pés dourados discretos e sombra de contato no piso para painéis estruturais,
 * permitindo ocultar 100% da baseImage branca quando o painel recebe uma capa ou pintura.
 */
export function createPanelSupportBase(type: string, width: number, height: number) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (ctx) {
    const drawFootGrad = (xStart: number, xEnd: number) => {
      const g = ctx.createLinearGradient(xStart, 0, xEnd, 0);
      g.addColorStop(0.0, '#9a6f0a');
      g.addColorStop(0.5, '#fef08a');
      g.addColorStop(1.0, '#b4830e');
      return g;
    };

    if (type === 'panel_round') {
      const sx = w / 300;
      const sy = h / 380;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(96 * sx, 370 * sy, 22 * sx, 3.5 * sy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(204 * sx, 370 * sy, 22 * sx, 3.5 * sy, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = drawFootGrad(80 * sx, 112 * sx);
      ctx.fillRect(94 * sx, 275 * sy, 4.5 * sx, 93 * sy);
      ctx.beginPath();
      ctx.moveTo(80 * sx, 368 * sy);
      ctx.lineTo(96.2 * sx, 365 * sy);
      ctx.lineTo(112 * sx, 368 * sy);
      ctx.lineTo(110 * sx, 370.5 * sy);
      ctx.lineTo(82 * sx, 370.5 * sy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = drawFootGrad(188 * sx, 220 * sx);
      ctx.fillRect(201.5 * sx, 275 * sy, 4.5 * sx, 93 * sy);
      ctx.beginPath();
      ctx.moveTo(188 * sx, 368 * sy);
      ctx.lineTo(203.8 * sx, 365 * sy);
      ctx.lineTo(220 * sx, 368 * sy);
      ctx.lineTo(218 * sx, 370.5 * sy);
      ctx.lineTo(190 * sx, 370.5 * sy);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'panel_arch') {
      const sx = w / 200;
      const sy = h / 380;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(100 * sx, 373 * sy, 82 * sx, 4 * sy, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = drawFootGrad(22 * sx, 46 * sx);
      ctx.beginPath();
      ctx.moveTo(22 * sx, 367 * sy);
      ctx.lineTo(46 * sx, 367 * sy);
      ctx.lineTo(44 * sx, 371.5 * sy);
      ctx.lineTo(24 * sx, 371.5 * sy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = drawFootGrad(154 * sx, 178 * sx);
      ctx.beginPath();
      ctx.moveTo(154 * sx, 367 * sy);
      ctx.lineTo(178 * sx, 367 * sy);
      ctx.lineTo(176 * sx, 371.5 * sy);
      ctx.lineTo(156 * sx, 371.5 * sy);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'panel_rect') {
      const sx = w / 300;
      const sy = h / 260;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(55 * sx, 252 * sy, 22 * sx, 3.5 * sy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(245 * sx, 252 * sy, 22 * sx, 3.5 * sy, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = drawFootGrad(40 * sx, 70 * sx);
      ctx.fillRect(53 * sx, 226 * sy, 4 * sx, 24 * sy);
      ctx.beginPath();
      ctx.moveTo(40 * sx, 250 * sy);
      ctx.lineTo(55 * sx, 247.5 * sy);
      ctx.lineTo(70 * sx, 250 * sy);
      ctx.lineTo(68 * sx, 252.5 * sy);
      ctx.lineTo(42 * sx, 252.5 * sy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = drawFootGrad(230 * sx, 260 * sx);
      ctx.fillRect(243 * sx, 226 * sy, 4 * sx, 24 * sy);
      ctx.beginPath();
      ctx.moveTo(230 * sx, 250 * sy);
      ctx.lineTo(245 * sx, 247.5 * sy);
      ctx.lineTo(260 * sx, 250 * sy);
      ctx.lineTo(258 * sx, 252.5 * sy);
      ctx.lineTo(232 * sx, 252.5 * sy);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'panel_half_moon') {
      const sx = w / 220;
      const sy = h / 380;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
      ctx.beginPath();
      ctx.ellipse(110 * sx, 373 * sy, 80 * sx, 4 * sy, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = drawFootGrad(32 * sx, 60 * sx);
      ctx.fillRect(44 * sx, 350 * sy, 4 * sx, 21 * sy);
      ctx.beginPath();
      ctx.moveTo(32 * sx, 371 * sy);
      ctx.lineTo(46 * sx, 368.5 * sy);
      ctx.lineTo(60 * sx, 371 * sy);
      ctx.lineTo(58 * sx, 373 * sy);
      ctx.lineTo(34 * sx, 373 * sy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = drawFootGrad(160 * sx, 188 * sx);
      ctx.fillRect(172 * sx, 350 * sy, 4 * sx, 21 * sy);
      ctx.beginPath();
      ctx.moveTo(160 * sx, 371 * sy);
      ctx.lineTo(174 * sx, 368.5 * sy);
      ctx.lineTo(188 * sx, 371 * sy);
      ctx.lineTo(186 * sx, 373 * sy);
      ctx.lineTo(162 * sx, 373 * sy);
      ctx.closePath();
      ctx.fill();
    }
  }

  return new Konva.Image({
    name: 'panel-support-base',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
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

  if (type === 'panel_half_moon') {
    const scaleX = width / 220;
    const scaleY = height / 380;
    return x >= 20 * scaleX && x <= 200 * scaleX && y >= 20 * scaleY && y <= 373 * scaleY;
  }

  if (type === 'panel_rect') {
    const scaleX = width / 300;
    const scaleY = height / 260;
    return x >= 15 * scaleX && x <= 285 * scaleX && y >= 15 * scaleY && y <= 253 * scaleY;
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
 * Constrói uma grade 64x64 de opacidade (Alpha Hit-Test) em memória para evitar
 * chamadas síncronas de getImageData na GPU durante o toque no mobile.
 */
function attachAlphaHitGrid(source: HTMLImageElement | HTMLCanvasElement) {
  try {
    const gridSize = 64;
    const hitCanvas = document.createElement('canvas');
    hitCanvas.width = gridSize;
    hitCanvas.height = gridSize;
    const ctx = hitCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(source, 0, 0, gridSize, gridSize);
    const data = ctx.getImageData(0, 0, gridSize, gridSize).data;
    const alphaGrid = new Uint8Array(gridSize * gridSize);
    for (let i = 0; i < gridSize * gridSize; i++) {
      alphaGrid[i] = data[i * 4 + 3];
    }
    (source as any).__alphaGrid = alphaGrid;
    (source as any).__alphaGridSize = gridSize;
  } catch {
    // Fallback silencioso se CORS bloquear
  }
}

/**
 * Carrega uma imagem ou SVG a partir de uma URL/DataURI e pré-rasteriza SVGs em
 * um Canvas Bitmap de alta performance (eliminando recálculo de filtros SVG a cada frame).
 */
export function loadImageAsync(src: string): Promise<HTMLImageElement> {
  const cached = imageBitmapCache.get(src);
  if (cached) {
    return Promise.resolve(cached as HTMLImageElement);
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const isSvg = src.startsWith('data:image/svg+xml') || src.endsWith('.svg');

      if (isSvg) {
        try {
          const natW = img.naturalWidth || img.width || 300;
          const natH = img.naturalHeight || img.height || 300;
          const maxDim = 768;
          const scale = Math.min(2, maxDim / Math.max(natW, natH, 1));
          const targetW = Math.max(1, Math.round(natW * scale));
          const targetH = Math.max(1, Math.round(natH * scale));

          const rasterCanvas = document.createElement('canvas');
          rasterCanvas.width = targetW;
          rasterCanvas.height = targetH;
          const rCtx = rasterCanvas.getContext('2d');
          if (rCtx) {
            rCtx.drawImage(img, 0, 0, targetW, targetH);
            (rasterCanvas as any).naturalWidth = natW;
            (rasterCanvas as any).naturalHeight = natH;
            (rasterCanvas as any).complete = true;
            attachAlphaHitGrid(rasterCanvas);
            imageBitmapCache.set(src, rasterCanvas);
            resolve(rasterCanvas as unknown as HTMLImageElement);
            return;
          }
        } catch {
          // Fallback para o elemento img padrão
        }
      }

      attachAlphaHitGrid(img);
      imageBitmapCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
