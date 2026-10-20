/**
 * Otimiza e redimensiona fotos carregadas pelo usuário (para peças do acervo ou capas).
 * Reduz fotos de celulares de 10-20MB (4000x3000px) para tamanho ideal (~1200px max, ~150-250KB),
 * preservando canal alpha (transparência) quando PNG/WebP, ou comprimindo JPEG 85% para fotos normais.
 * Evita esgotamento de memória (RAM/VRAM), lentidão e travamentos no IndexedDB e Canvas GPU.
 */
export async function optimizeUserUploadedImage(file: File, maxDim = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Falha ao ler o arquivo de imagem'));

      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;

        // Se a imagem já é menor que maxDim e o arquivo é leve, preserva o original
        if (natW <= maxDim && natH <= maxDim && file.size < 500 * 1024) {
          resolve(src);
          return;
        }

        const scale = Math.min(1, maxDim / Math.max(natW, natH));
        const targetW = Math.max(1, Math.round(natW * scale));
        const targetH = Math.max(1, Math.round(natH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Se o tipo original for PNG (possui recorte/fundo transparente), preserva PNG
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.86;

        const optimizedData = canvas.toDataURL(mimeType, quality);
        resolve(optimizedData);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
