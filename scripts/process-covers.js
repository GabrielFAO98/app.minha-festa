import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const INBOX_DIR = path.join(rootDir, 'covers_inbox');
const PROCESSED_DIR = path.join(INBOX_DIR, '_processados');
const OUTPUT_DIR = path.join(rootDir, 'public', 'covers');
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

// Parse args: --theme="Nome" --names="Nome1,Nome2" --files="15.png,16.png"
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    theme: '',
    names: [],
    files: []
  };

  for (const arg of args) {
    if (arg.startsWith('--theme=')) {
      result.theme = arg.replace('--theme=', '').replace(/^["']|["']$/g, '').trim();
    } else if (arg.startsWith('--names=')) {
      const namesStr = arg.replace('--names=', '').replace(/^["']|["']$/g, '').trim();
      result.names = namesStr.split(',').map((n) => n.trim());
    } else if (arg.startsWith('--files=')) {
      const filesStr = arg.replace('--files=', '').replace(/^["']|["']$/g, '').trim();
      result.files = filesStr.split(',').map((f) => f.trim());
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

  const { theme, names, files: targetFiles } = parseArgs();
  const defaultTheme = theme || 'Novas Estampas';

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
    console.log('\nNenhuma imagem encontrada em covers_inbox/ para processar.');
    console.log('Dica: coloque arquivos de imagem em covers_inbox/ e rode novamente.\n');
    return;
  }

  console.log(`\nLocalizadas ${files.length} imagem(ns) para processar...`);
  console.log(`Tema alvo: "${defaultTheme}"\n`);

  const newCoverEntries = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rawPath = path.join(INBOX_DIR, file);
    const parsedName = path.parse(file).name;

    // Define nome amigável da estampa
    const coverName = names[i] || (theme ? `${theme} ${i + 1}` : parsedName);
    const combinedName = theme && coverName.toLowerCase().startsWith(theme.toLowerCase())
      ? coverName
      : (theme ? `${theme} ${coverName}` : coverName);
    const slug = slugify(combinedName);
    const id = `cover-${slug}`;
    const outputFilename = `${slug}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    console.log(`[${i + 1}/${files.length}] Processando: ${file} -> ${outputFilename} ("${coverName}")`);

    // 1. Aparar margens transparentes e converter para WebP leve de alta fidelidade
    try {
      const trimmedBuffer = await sharp(rawPath).trim().toBuffer();
      await sharp(trimmedBuffer).webp({ quality: 92 }).toFile(outputPath);

      const origSize = (fs.statSync(rawPath).size / 1024).toFixed(1);
      const newSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`      Tamanho otimizado: ${origSize} KB -> ${newSize} KB`);

      // 2. Mover arquivo original para _processados para manter o inbox limpo
      const processedDest = path.join(PROCESSED_DIR, `${Date.now()}_${file}`);
      fs.renameSync(rawPath, processedDest);

      newCoverEntries.push({
        id,
        themeName: defaultTheme,
        name: coverName,
        targetType: 'all',
        imageUrl: `/covers/${outputFilename}`
      });
    } catch (err) {
      console.error(`      Erro ao processar ${file}:`, err.message);
    }
  }

  if (newCoverEntries.length === 0) {
    console.log('Nenhuma capa processada com sucesso.');
    return;
  }

  // 3. Atualizar src/core/presets-data.ts com as novas capas
  console.log(`\nAtualizando ${PRESETS_FILE} com ${newCoverEntries.length} novas capas...`);
  let presetsContent = fs.readFileSync(PRESETS_FILE, 'utf8');

  // Localiza a declaração DEFAULT_THEME_COVERS
  const coversArrayMarker = 'export const DEFAULT_THEME_COVERS: ThemeCover[] = [';
  const markerIndex = presetsContent.indexOf(coversArrayMarker);

  if (markerIndex === -1) {
    console.error('Nao foi possivel encontrar DEFAULT_THEME_COVERS em presets-data.ts');
    return;
  }

  // Encontra o fechamento ]; correspondente
  const closingIndex = presetsContent.indexOf('];', markerIndex);
  if (closingIndex === -1) {
    console.error('Nao foi possivel encontrar o fim do array DEFAULT_THEME_COVERS');
    return;
  }

  // Gera o bloco formatado de código para inserção
  const formattedEntries = newCoverEntries
    .map(
      (entry) => `  {
    id: '${entry.id}',
    themeName: '${entry.themeName}',
    name: '${entry.name}',
    targetType: 'all',
    imageUrl: '${entry.imageUrl}'
  }`
    )
    .join(',\n');

  // Adiciona com vírgula se o array já tem itens
  const arrayContent = presetsContent.substring(markerIndex + coversArrayMarker.length, closingIndex).trim();
  const needsLeadingComma = arrayContent.length > 0 && !arrayContent.endsWith(',');

  const insertion = (needsLeadingComma ? ',\n' : '\n') + formattedEntries + '\n';
  const updatedPresetsContent =
    presetsContent.substring(0, closingIndex).trimEnd() + insertion + presetsContent.substring(closingIndex);

  fs.writeFileSync(PRESETS_FILE, updatedPresetsContent, 'utf8');
  console.log('Catálogo presets-data.ts atualizado com sucesso!');
  console.log('\nTudo pronto! As capas foram adicionadas e estao prontas para uso no estúdio.\n');
}

main().catch((err) => {
  console.error('Erro geral no script:', err);
  process.exit(1);
});
