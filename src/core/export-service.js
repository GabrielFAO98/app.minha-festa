// Serviço de Exportação de Imagens e Geração de Romaneio para WhatsApp

/**
 * Agrupa os elementos da decoração e gera o romaneio/checklist
 * @param {Array} elements Lista de elementos do canvas retornada por getSceneElements()
 * @returns {Object} Resumo com contagem de itens, capas e checklist textual
 */
export function generateRomaneio(elements) {
  const itemMap = new Map();
  const coversList = [];

  elements.forEach((item) => {
    const key = item.name;
    if (itemMap.has(key)) {
      itemMap.get(key).quantity += 1;
    } else {
      itemMap.set(key, {
        name: item.name,
        category: item.category,
        quantity: 1,
        widthCm: item.widthCm,
        heightCm: item.heightCm
      });
    }

    if (item.customCoverUrl) {
      coversList.push({
        itemName: item.name,
        coverUrl: item.customCoverUrl
      });
    }
  });

  const checklist = Array.from(itemMap.values());

  return {
    totalItems: elements.length,
    checklist,
    coversCount: coversList.length,
    coversList
  };
}

/**
 * Cria o texto formatado do romaneio para envio via WhatsApp ou Clipboard
 * @param {string} projectTitle Nome do Projeto / Festa
 * @param {Object} romaneio Dados retornados por generateRomaneio()
 * @param {string} clientName Nome do cliente (opcional)
 * @returns {string} Mensagem pronta com emojis
 */
export function formatWhatsAppMessage(projectTitle, romaneio, clientName = '') {
  let text = `🎉 *PROJETO DE DECORAÇÃO — MINHA FESTA*\n`;
  if (clientName) {
    text += `👤 *Cliente:* ${clientName}\n`;
  }
  text += `🎈 *Cenário:* ${projectTitle || 'Decoração Pegue-Monte'}\n\n`;
  text += `📋 *LISTA DE ITENS UTILIZADOS (ROMANEIO):*\n`;

  romaneio.checklist.forEach((item) => {
    text += `▪️ *${item.quantity}x* ${item.name} (${item.widthCm}x${item.heightCm}cm)\n`;
  });

  if (romaneio.coversCount > 0) {
    text += `\n🎨 *Capas & Estampas Inclusas:* ${romaneio.coversCount} peça(s) personalizada(s)\n`;
  }

  text += `\n✨ _Simulação visual gerada no Minha Festa App._`;
  return text;
}

/**
 * Abre o WhatsApp com a mensagem pré-formatada
 * @param {string} phone Telefone com DDD (opcional)
 * @param {string} text Mensagem formatada
 */
export function shareViaWhatsApp(phone, text) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  let url = '';
  if (cleanPhone) {
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    url = `https://wa.me/${fullPhone}?text=${encodedText}`;
  } else {
    url = `https://wa.me/?text=${encodedText}`;
  }
  window.open(url, '_blank');
}

/**
 * Faz download da imagem gerada no dispositivo
 * @param {string} dataUrl Base64 da imagem
 * @param {string} filename Nome do arquivo para download
 */
export function downloadImage(dataUrl, filename = 'decoracao-minha-festa.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

