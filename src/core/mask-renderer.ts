import Konva from 'konva';
import { svgToDataUrl, generateOrganicBeanTabletopOnlySVG, generateSkirtTablePartSVG } from './presets-data';
import { adjustColorBrightness } from './modular-svg-generator';

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
    const scaleX = width / 200;
    const scaleY = height / 380;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(18 * scaleX, 368 * scaleY);
      ctx.lineTo(18 * scaleX, 130 * scaleY);
      ctx.bezierCurveTo(
        18 * scaleX, 35 * scaleY,
        95 * scaleX, 18 * scaleY,
        182 * scaleX, 22 * scaleY
      );
      ctx.lineTo(182 * scaleX, 368 * scaleY);
      ctx.closePath();
    };
  }


  if (type === 'table_skirt_scallop_bottom' || type === 'table_skirt_straight_bottom') {
    const scaleX = width / 320;
    const scaleY = height / 200;
    const isStraight = type.includes('straight');
    const yTop = (isStraight ? 68 : 56) * scaleY;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(22 * scaleX, yTop);
      ctx.lineTo(298 * scaleX, yTop);
      ctx.lineTo(296 * scaleX, 182 * scaleY);
      for (let i = 33; i >= 0; i--) {
        const px = 24 + i * 8;
        ctx.quadraticCurveTo((px + 4) * scaleX, 185 * scaleY, px * scaleX, 182 * scaleY);
      }
      ctx.lineTo(22 * scaleX, 182 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'table_skirt_scallop_top') {
    const scaleX = width / 320;
    const scaleY = height / 200;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(46 * scaleX, 30 * scaleY);
      ctx.lineTo(274 * scaleX, 30 * scaleY);
      ctx.lineTo(300 * scaleX, 56 * scaleY);
      ctx.lineTo(300 * scaleX, 95 * scaleY);
      for (let i = 6; i >= 0; i--) {
        const x1 = (20 + i * 40) * scaleX;
        const x2 = (20 + (i + 1) * 40) * scaleX;
        ctx.bezierCurveTo(
          x2 - 10 * scaleX, 110 * scaleY,
          x1 + 10 * scaleX, 110 * scaleY,
          x1, 95 * scaleY
        );
      }
      ctx.lineTo(20 * scaleX, 56 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'table_skirt_straight_top') {
    const scaleX = width / 320;
    const scaleY = height / 200;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(46 * scaleX, 30 * scaleY);
      ctx.lineTo(274 * scaleX, 30 * scaleY);
      ctx.lineTo(300 * scaleX, 56 * scaleY);
      ctx.lineTo(300 * scaleX, 68 * scaleY);
      ctx.lineTo(20 * scaleX, 68 * scaleY);
      ctx.lineTo(20 * scaleX, 56 * scaleY);
      ctx.closePath();
    };
  }

  if (type === 'table_skirt_scallop' || type === 'table_skirt_straight') {
    const scaleX = width / 320;
    const scaleY = height / 200;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.moveTo(46 * scaleX, 30 * scaleY);
      ctx.lineTo(274 * scaleX, 30 * scaleY);
      ctx.lineTo(300 * scaleX, 56 * scaleY);
      ctx.lineTo(298 * scaleX, 182 * scaleY);
      ctx.lineTo(22 * scaleX, 182 * scaleY);
      ctx.lineTo(20 * scaleX, 56 * scaleY);
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

  if (type.startsWith('table_skirt') || type.startsWith('table_organic_bean')) {
    const vHeight = type === 'table_organic_bean_g' ? 300 : (type === 'table_organic_bean_m' ? 250 : 200);
    const scaleX = width / 320;
    const scaleY = height / vHeight;
    const cx = 160 * scaleX;
    const rx = 55 * scaleX;
    const ry = 12 * scaleY;
    const yTop = 55 * scaleY;
    const yBottom = (vHeight - 12) * scaleY;

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
    const scaleX = width / 200;
    const scaleY = height / 380;

    return (ctx: any) => {
      ctx.beginPath();
      ctx.rect(18 * scaleX, 18 * scaleY, 164 * scaleX, 350 * scaleY);
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
  } else if (type === 'panel_arch' || type === 'panel_rect' || type === 'panel_half_moon') {
    targetX = nodeWidth * (18 / 200);
    targetY = nodeHeight * (18 / 380);
    targetW = nodeWidth * (164 / 200);
    targetH = nodeHeight * (350 / 380);
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
  } else if (type.includes('table_skirt')) {
    if (type.includes('bottom')) {
      targetX = nodeWidth * (20 / 320);
      targetY = nodeHeight * (56 / 200);
      targetW = nodeWidth * (280 / 320);
      targetH = nodeHeight * (128 / 200);
    } else if (type.includes('top')) {
      targetX = nodeWidth * (20 / 320);
      targetY = nodeHeight * (30 / 200);
      targetW = nodeWidth * (280 / 320);
      targetH = nodeHeight * ((type.includes('straight') ? 40 : 82) / 200);
    } else {
      targetX = nodeWidth * (20 / 320);
      targetY = nodeHeight * (30 / 200);
      targetW = nodeWidth * (280 / 320);
      targetH = nodeHeight * (154 / 200);
    }
  } else if (type.startsWith('table_organic_bean')) {
    const vHeight = type === 'table_organic_bean_g' ? 300 : (type === 'table_organic_bean_m' ? 250 : 200);
    targetX = nodeWidth * (105 / 320);
    targetY = nodeHeight * (43 / vHeight);
    targetW = nodeWidth * (110 / 320);
    targetH = nodeHeight * ((vHeight - 45) / vHeight);
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
    bodyGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.08)');
    bodyGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.0)');
    bodyGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.0)');
    bodyGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(xLeft, yTop - ry, rx * 2, (yBottom - yTop) + ry * 2);

    const topGrad = ctx.createLinearGradient(cx, yTop - ry, cx, yTop + ry);
    topGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.02)');
    topGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.05)');

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
    const scaleX = w / 200;
    const scaleY = h / 380;
    const xLeft = 18 * scaleX;
    const yTop = 18 * scaleY;
    const yBottom = 368 * scaleY;

    const vertGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
    vertGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.08)');
    vertGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
    vertGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

    ctx.fillStyle = vertGrad;
    ctx.fillRect(xLeft, yTop, 164 * scaleX, yBottom - yTop);
  } else if (type.startsWith('table_organic_bean')) {
    const vHeight = type === 'table_organic_bean_g' ? 300 : (type === 'table_organic_bean_m' ? 250 : 200);
    const scaleX = w / 320;
    const scaleY = h / vHeight;
    const cx = 160 * scaleX;
    const rx = 55 * scaleX;
    const ry = 12 * scaleY;
    const yTop = 55 * scaleY;
    const yBottom = (vHeight - 12) * scaleY;
    const xLeft = cx - rx;
    const xRight = cx + rx;

    const bodyGrad = ctx.createLinearGradient(xLeft, 0, xRight, 0);
    bodyGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.08)');
    bodyGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.0)');
    bodyGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.0)');
    bodyGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.10)');

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(xLeft, yTop - ry, rx * 2, (yBottom - yTop) + ry * 2);

    const dropShadowGrad = ctx.createLinearGradient(0, yTop, 0, yTop + 22 * scaleY);
    dropShadowGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.11)');
    dropShadowGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = dropShadowGrad;
    ctx.fillRect(xLeft, yTop, rx * 2, 22 * scaleY);
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
    const scaleX = w / 200;
    const scaleY = h / 380;
    const x = 18 * scaleX;
    const y = 18 * scaleY;
    const rectW = 164 * scaleX;
    const rectH = 350 * scaleY;

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
    radGrad.addColorStop(0.0, 'rgba(15, 23, 42, 0.08)');
    radGrad.addColorStop(0.45, 'rgba(15, 23, 42, 0.04)');
    radGrad.addColorStop(0.8, 'rgba(15, 23, 42, 0.01)');
    radGrad.addColorStop(1.0, 'rgba(15, 23, 42, 0)');
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

      ctx.fillStyle = drawFootGrad(88 * sx, 104.5 * sx);
      ctx.fillRect(95 * sx, 275 * sy, 2.5 * sx, 93.5 * sy);
      ctx.beginPath();
      ctx.moveTo(88 * sx, 368.5 * sy);
      ctx.lineTo(96.25 * sx, 367 * sy);
      ctx.lineTo(104.5 * sx, 368.5 * sy);
      ctx.lineTo(103.5 * sx, 370 * sy);
      ctx.lineTo(89 * sx, 370 * sy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = drawFootGrad(195.5 * sx, 212 * sx);
      ctx.fillRect(202.5 * sx, 275 * sy, 2.5 * sx, 93.5 * sy);
      ctx.beginPath();
      ctx.moveTo(195.5 * sx, 368.5 * sy);
      ctx.lineTo(203.75 * sx, 367 * sy);
      ctx.lineTo(212 * sx, 368.5 * sy);
      ctx.lineTo(211 * sx, 370 * sy);
      ctx.lineTo(196.5 * sx, 370 * sy);
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
    const scaleX = width / 200;
    const scaleY = height / 380;
    return x >= 18 * scaleX && x <= 182 * scaleX && y >= 18 * scaleY && y <= 373 * scaleY;
  }

  if (type === 'panel_rect') {
    const scaleX = width / 200;
    const scaleY = height / 380;
    return x >= 18 * scaleX && x <= 182 * scaleX && y >= 18 * scaleY && y <= 373 * scaleY;
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

  if (type.startsWith('table_organic_bean')) {
    return x >= 0 && x <= width && y >= 0 && y <= height;
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

/**
 * Cria o nó Konva do tampo orgânico feijão sobreposto às capas/pinturas do cilindro
 */
export async function createOrganicBeanTabletopNodeAsync(
  width: number,
  height: number,
  tabletopColor: string = '#FAF8F5',
  type: string = 'table_organic_bean'
): Promise<Konva.Image> {
  const svgStr = generateOrganicBeanTabletopOnlySVG(tabletopColor, type);
  const dataUrl = svgToDataUrl(svgStr);
  const img = await loadImageAsync(dataUrl);

  return new Konva.Image({
    name: 'tabletop-overlay',
    image: img,
    width: width,
    height: height,
    listening: false
  });
}


/**
 * Cria a sombra suave de contato no piso para mesas retangulares com saia
 */
export function createTableFloorShadow(width: number, height: number): Konva.Image {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (ctx) {
    const scaleX = w / 320;
    const scaleY = h / 200;
    const cx = w * 0.5;
    const cy = 186 * scaleY;
    const rx = 142 * scaleX;
    const ry = 8 * scaleY;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.0, ry / rx);
    const radGrad = ctx.createRadialGradient(0, 0, rx * 0.25, 0, 0, rx);
    radGrad.addColorStop(0.0, 'rgba(15, 23, 42, 0.35)');
    radGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
    radGrad.addColorStop(1.0, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }

  return new Konva.Image({
    name: 'table-floor-shadow',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
  });
}

/**
 * Cria a camada pré-renderizada de dobras e pregas verticais 3D para a saia da mesa
 */
export function createPleatedShadingOverlay(type: string, width: number, height: number): Konva.Image {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (ctx) {
    const scaleX = w / 320;
    const scaleY = h / 200;
    const isStraight = type.includes('straight');
    const yTop = (isStraight ? 68 : 56) * scaleY;
    const yBottom = 184 * scaleY;
    const pleatHeight = yBottom - yTop;

    for (let i = 0; i < 34; i++) {
      const px = (24 + i * 8) * scaleX;
      const pw = 4 * scaleX;
      const isEven = i % 2 === 0;

      ctx.fillStyle = isEven ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(px, yTop, pw, pleatHeight);

      ctx.fillStyle = isEven ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(px + pw, yTop, pw, pleatHeight);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.lineWidth = 0.8 * scaleX;
      ctx.beginPath();
      ctx.moveTo(px, yTop);
      ctx.lineTo(px, yBottom);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 0.6 * scaleX;
      ctx.beginPath();
      ctx.moveTo(px + pw, yTop);
      ctx.lineTo(px + pw, yBottom);
      ctx.stroke();
    }

    const dropH = (isStraight ? 32 : 65) * scaleY;
    const dropGrad = ctx.createLinearGradient(0, yTop, 0, yTop + dropH);
    dropGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.35)');
    dropGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.10)');
    dropGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = dropGrad;
    ctx.fillRect(20 * scaleX, yTop, 280 * scaleX, dropH);
  }

  return new Konva.Image({
    name: 'pleated-shading-overlay',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
  });
}

/**
 * Cria a camada pré-renderizada de brilho do tampo, festonê e acabamentos da sobreposição
 */
export function createTopShadingOverlay(type: string, width: number, height: number, color?: string | null): Konva.Image {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const ctx = offCanvas.getContext('2d');

  if (ctx) {
    const scaleX = w / 320;
    const scaleY = h / 200;
    const isScallop = type.includes('scallop');

    const surfaceGrad = ctx.createLinearGradient(0, 30 * scaleY, 0, 56 * scaleY);
    surfaceGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.34)');
    surfaceGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.05)');

    ctx.fillStyle = surfaceGrad;
    ctx.beginPath();
    ctx.moveTo(46 * scaleX, 30 * scaleY);
    ctx.lineTo(274 * scaleX, 30 * scaleY);
    ctx.lineTo(298 * scaleX, 56 * scaleY);
    ctx.lineTo(22 * scaleX, 56 * scaleY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1 * scaleY;
    ctx.beginPath();
    ctx.moveTo(22 * scaleX, 56 * scaleY);
    ctx.lineTo(298 * scaleX, 56 * scaleY);
    ctx.stroke();

    if (isScallop) {
      const drapeGrad = ctx.createLinearGradient(0, 56 * scaleY, 0, 110 * scaleY);
      drapeGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
      drapeGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.02)');
      drapeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.20)');

      ctx.fillStyle = drapeGrad;
      ctx.beginPath();
      ctx.moveTo(20 * scaleX, 56 * scaleY);
      ctx.lineTo(20 * scaleX, 95 * scaleY);
      for (let i = 0; i < 7; i++) {
        const x1 = (20 + i * 40) * scaleX;
        const x2 = (20 + (i + 1) * 40) * scaleX;
        ctx.bezierCurveTo(
          x1 + 10 * scaleX, 110 * scaleY,
          x2 - 10 * scaleX, 110 * scaleY,
          x2, 95 * scaleY
        );
      }
      ctx.lineTo(300 * scaleX, 56 * scaleY);
      ctx.closePath();
      ctx.fill();

      const borderHex = color ? adjustColorBrightness(color, -0.22) : '#e11d48';
      ctx.strokeStyle = borderHex;
      ctx.lineWidth = 4.8 * scaleX;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(20 * scaleX, 95 * scaleY);
      for (let i = 0; i < 7; i++) {
        const x1 = (20 + i * 40) * scaleX;
        const x2 = (20 + (i + 1) * 40) * scaleX;
        ctx.bezierCurveTo(
          x1 + 10 * scaleX, 110 * scaleY,
          x2 - 10 * scaleX, 110 * scaleY,
          x2, 95 * scaleY
        );
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2 * scaleX;
      ctx.stroke();
    } else {
      const bandGrad = ctx.createLinearGradient(0, 56 * scaleY, 0, 68 * scaleY);
      bandGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.20)');
      bandGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.12)');

      ctx.fillStyle = bandGrad;
      ctx.fillRect(20 * scaleX, 56 * scaleY, 280 * scaleX, 12 * scaleY);

      const borderHex = color ? adjustColorBrightness(color, -0.25) : '#ca8a04';
      ctx.strokeStyle = borderHex;
      ctx.lineWidth = 1.2 * scaleY;
      ctx.beginPath();
      ctx.moveTo(20 * scaleX, 68 * scaleY);
      ctx.lineTo(300 * scaleX, 68 * scaleY);
      ctx.stroke();
    }
  }

  return new Konva.Image({
    name: 'top-shading-overlay',
    image: offCanvas,
    width: width,
    height: height,
    listening: false
  });
}
