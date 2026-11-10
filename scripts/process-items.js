import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INBOX_DIR = path.join(rootDir, 'items_inbox');
const PROCESSED_DIR = path.join(INBOX_DIR, '_processados');
const OUTPUT_DIR = path.join(rootDir, 'public', 'items');
const PRESETS_FILE = path.join(rootDir, 'src', 'core', 'presets-data.ts');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    category: 'displays',
    type: 'display',
    theme: '',
    names: [],
    files: [],
    heightFloor: 70,
    heightTable: 24,
    bothSizes: false
  };

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      result.category = arg.replace('--category=', '').replace(/^["']|["']$/g, '').trim();
    } else if (arg.startsWith('--type=')) {
      result.type = arg.replace('--type=', '').replace(/^["']|["']$/g, '').trim();
    } else if (arg.startsWith('--theme=')) {
      result.theme = arg.replace('--theme=', '').replace(/^["']|["']$/g, '').trim();
    } else if (arg.startsWith('--names=')) {
      const namesStr = arg.replace('--names=', '').replace(/^["']|["']$/g, '').trim();
      result.names = namesStr.split(',').map((n) => n.trim());
    } else if (arg.startsWith('--files=')) {
      const filesStr = arg.replace('--files=', '').replace(/^["']|["']$/g, '').trim();
      result.files = filesStr.split(',').map((f) => f.trim());
    } else if (arg.startsWith('--heightFloor=')) {
      result.heightFloor = Number(arg.replace('--heightFloor=', '')) || 70;
    } else if (arg.startsWith('--heightTable=')) {
      result.heightTable = Number(arg.replace('--heightTable=', '')) || 24;
    } else if (arg === '--bothSizes' || arg === '--both') {
      result.bothSizes = true;
    }
  }
  return result;
}

async function main() {
  if (!fs.existsSync(INBOX_DIR)) {
    fs.mkdirSync(INBOX_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const { category, type, theme, names, files: targetFiles, heightFloor, heightTable, bothSizes } = parseArgs();

  let files = fs
    .readdirSync(INBOX_DIR)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) && !f.startsWith('.');
    })
    .sort();

  if (targetFiles.length > 0) {
    files = files.filter((f) => targetFiles.includes(f));
  }

  if (files.length === 0) {
    console.log('\nNenhuma imagem encontrada em items_inbox/ para processar.');
    console.log('Dica: coloque fotos dos itens em items_inbox/ e rode novamente.\n');
    return;
  }

  console.log(`\nLocalizadas ${files.length} imagem(ns) de itens para processar...`);
  console.log(`Categoria: "${category}" | Tipo: "${type}" | Tema: "${theme || 'Geral'}"\n`);

  const newPresetEntries = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rawPath = path.join(INBOX_DIR, file);
    const parsedName = path.parse(file).name;

    const baseName = names[i] || parsedName;
    const slug = slugify(theme ? `${theme}-${baseName}` : baseName);
    const outputFilename = `item-${slug}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`[${i + 1}/${files.length}] Processando item: ${file} -> ${outputFilename} ("${baseName}")`);

    try {
      // 1. Recorte neural com @imgly/background-removal-node
      console.log('      Recortando fundo com IA...');
      const fileUrl = pathToFileURL(rawPath).href;
      const blob = await removeBackground(fileUrl);
      const rawCutBuffer = Buffer.from(await blob.arrayBuffer());

      // 2. Auto-Trim milimétrico e exportação WebP com sharp
      console.log('      Aplicando auto-trim milimétrico e otimização WebP...');
      const trimmedBuffer = await sharp(rawCutBuffer).trim().webp({ quality: 90 }).toBuffer();
      fs.writeFileSync(outputPath, trimmedBuffer);

      const metadata = await sharp(trimmedBuffer).metadata();
      const ratio = metadata.width / metadata.height;

      const origSize = (fs.statSync(rawPath).size / 1024).toFixed(1);
      const newSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`      Resolução final: ${metadata.width}x${metadata.height}px | Tamanho: ${origSize} KB -> ${newSize} KB`);

      // 3. Mover original para _processados
      const processedDest = path.join(PROCESSED_DIR, `${Date.now()}_${file}`);
      fs.renameSync(rawPath, processedDest);

      if (bothSizes || category === 'displays') {
        // Gera versão Chão
        const floorWidth = Math.round(ratio * heightFloor);
        newPresetEntries.push({
          id: `preset-display-chao-${slug}`,
          name: `Display de Chão ${theme ? theme + ' - ' : ''}${baseName}`,
          category,
          type,
          svgRole: 'photo',
          widthCm: floorWidth,
          heightCm: heightFloor,
          previewUrl: `/items/${outputFilename}`,
          isCustom: false,
          stockQuantity: 1,
          rentalPrice: 28
        });

        // Gera versão Mesa
        const tableWidth = Math.round(ratio * heightTable);
        newPresetEntries.push({
          id: `preset-display-mesa-${slug}`,
          name: `Display de Mesa ${theme ? theme + ' - ' : ''}${baseName}`,
          category,
          type,
          svgRole: 'photo',
          widthCm: tableWidth,
          heightCm: heightTable,
          previewUrl: `/items/${outputFilename}`,
          isCustom: false,
          stockQuantity: 1,
          rentalPrice: 12
        });
      } else {
        const itemWidth = Math.round(ratio * heightFloor);
        newPresetEntries.push({
          id: `preset-${slug}`,
          name: `${theme ? theme + ' - ' : ''}${baseName}`,
          category,
          type,
          svgRole: 'photo',
          widthCm: itemWidth,
          heightCm: heightFloor,
          previewUrl: `/items/${outputFilename}`,
          isCustom: false,
          stockQuantity: 1,
          rentalPrice: 30
        });
      }
    } catch (err) {
      console.error(`      Erro ao processar ${file}:`, err.message);
    }
  }

  if (newPresetEntries.length === 0) {
    console.log('Nenhum item processado com sucesso.');
    return;
  }

  // 4. Injetar em src/core/presets-data.ts
  console.log(`\nAtualizando ${PRESETS_FILE} com ${newPresetEntries.length} novos itens...`);
  let presetsContent = fs.readFileSync(PRESETS_FILE, 'utf8');

  const itemsArrayMarker = 'export const DEFAULT_PRESET_ITEMS: PresetItem[] = [';
  const markerIndex = presetsContent.indexOf(itemsArrayMarker);

  if (markerIndex === -1) {
    console.error('Nao foi possivel encontrar DEFAULT_PRESET_ITEMS em presets-data.ts');
    return;
  }

  const coversMarkerIndex = presetsContent.indexOf('export const DEFAULT_THEME_COVERS');
  const closingIndex = presetsContent.lastIndexOf('];', coversMarkerIndex);

  if (closingIndex === -1) {
    console.error('Nao foi possivel encontrar o fim do array DEFAULT_PRESET_ITEMS');
    return;
  }

  const formattedEntries = newPresetEntries
    .map(
      (entry) => `  {
    id: '${entry.id}',
    name: '${entry.name}',
    category: '${entry.category}',
    type: '${entry.type}',
    svgRole: 'photo',
    widthCm: ${entry.widthCm},
    heightCm: ${entry.heightCm},
    previewUrl: '${entry.previewUrl}',
    isCustom: false,
    stockQuantity: ${entry.stockQuantity},
    rentalPrice: ${entry.rentalPrice}
  }`
    )
    .join(',\n');

  const arrayContent = presetsContent.substring(markerIndex + itemsArrayMarker.length, closingIndex).trim();
  const needsLeadingComma = arrayContent.length > 0 && !arrayContent.endsWith(',');

  const insertion = (needsLeadingComma ? ',\n' : '\n') + formattedEntries + '\n';
  const updatedPresetsContent =
    presetsContent.substring(0, closingIndex).trimEnd() + insertion + presetsContent.substring(closingIndex);

  fs.writeFileSync(PRESETS_FILE, updatedPresetsContent, 'utf8');
  console.log('Catálogo presets-data.ts atualizado com sucesso!');
  console.log('\nTudo pronto! Os itens foram adicionados ao estúdio com dimensões reais em centímetros.\n');
}

main().catch((err) => {
  console.error('Erro geral no script:', err);
  process.exit(1);
});
