const GEMINI_MODEL = 'gemini-3.1-flash-image';

const MASTER_REALISM_PROMPT =
  'Transforme em uma fotografia real de decoração de festa, preservando as cores originais de cada item, as estampas, os formatos e as posições exatamente no mesmo lugar. Mantenha os painéis do fundo rígidos, planos, foscos e firmes até o chão, sem efeito de tecido solto, dobras ou hastes aparentes. Ilumine toda a cena como uma foto natural de salão de festas, com profundidade tridimensional realista, texturas naturais e sombras suaves no piso para móveis, mesas, balões e enfeites.';

const MAX_BODY_BYTES = 6 * 1024 * 1024;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return await new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Imagem muito grande para envio.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('JSON inválido na requisição.'));
      }
    });

    req.on('error', (err) => reject(err));
  });
}

function normalizeImageInput(imageBase64, fallbackMimeType) {
  const raw = String(imageBase64 || '').trim();
  const dataUrlMatch = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return { mimeType: dataUrlMatch[1], data: dataUrlMatch[2] };
  }
  return {
    mimeType: fallbackMimeType || 'image/jpeg',
    data: raw
  };
}

/**
 * Serverless Function (Vercel + Vite dev middleware) que envia a prévia do cenário
 * para o Gemini mantendo a GEMINI_API_KEY protegida exclusivamente no backend.
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Método não permitido. Use POST.' });
    return;
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    sendJson(res, 500, {
      error: 'Chave GEMINI_API_KEY não configurada no servidor.'
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: err?.message || 'Corpo da requisição inválido.' });
    return;
  }

  const { imageBase64, mimeType: inputMimeType } = body || {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    sendJson(res, 400, { error: 'Imagem do cenário não informada.' });
    return;
  }

  const normalized = normalizeImageInput(imageBase64, inputMimeType);
  if (!normalized.data) {
    sendJson(res, 400, { error: 'Conteúdo base64 da imagem está vazio.' });
    return;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  try {
    const geminiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: MASTER_REALISM_PROMPT },
              {
                inlineData: {
                  mimeType: normalized.mimeType,
                  data: normalized.data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '9:16',
            imageSize: '1K'
          }
        }
      })
    });

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      const apiMsg = data?.error?.message || `Erro HTTP ${geminiResponse.status}`;
      const statusOut = geminiResponse.status === 429 ? 429 : 502;
      let userError = `Não foi possível processar o realismo com a IA (${apiMsg}).`;

      if (statusOut === 429) {
        const needsBilling = /limit:\s*0|billing|free_tier/i.test(apiMsg);
        userError = needsBilling
          ? 'Geração de imagem bloqueada no plano gratuito do Google (cota 0). Ative o faturamento (Pay-as-you-go) no Google AI Studio.'
          : 'Limite temporário de requisições na API atingido. Aguarde alguns segundos e tente novamente.';
      }

      sendJson(res, statusOut, { error: userError });
      return;
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
    const inline = imagePart?.inlineData || imagePart?.inline_data;

    if (!inline?.data) {
      const blockReason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
      sendJson(res, 502, {
        error: blockReason
          ? `A IA não retornou imagem para este cenário (${blockReason}).`
          : 'A IA não retornou uma imagem válida.'
      });
      return;
    }

    const outMimeType = inline.mimeType || inline.mime_type || 'image/png';
    const realisticDataUrl = `data:${outMimeType};base64,${inline.data}`;

    sendJson(res, 200, {
      realisticDataUrl,
      mimeType: outMimeType
    });
  } catch (err) {
    console.error('Erro ao conectar com a API do Gemini:', err);
    sendJson(res, 502, {
      error: 'Falha de comunicação com o serviço de IA. Verifique sua conexão e tente novamente.'
    });
  }
}

