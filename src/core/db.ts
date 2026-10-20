import Dexie, { type Table } from 'dexie';
import { DEFAULT_PRESET_ITEMS, DEFAULT_THEME_COVERS } from './presets-data';
import type { PresetItem, ThemeCover, ProjectData } from '../types';

export interface CoverItemRecord extends ThemeCover {
  isCustom?: boolean;
}

// Inicialização tipada do Banco IndexedDB com Dexie
export class MinhaFestaDatabase extends Dexie {
  items!: Table<PresetItem, string>;
  covers!: Table<CoverItemRecord, string>;
  projects!: Table<ProjectData, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('MinhaFestaDB');
    this.version(1).stores({
      items: 'id, name, category, type, isCustom, createdAt',
      covers: 'id, themeName, targetType, createdAt',
      projects: 'id, title, clientName, updatedAt',
      settings: 'key'
    });
  }
}

export const db = new MinhaFestaDatabase();

// Inicialização e sincronização dos presets de fábrica
export async function initDatabase(): Promise<void> {
  const timestamp = Date.now();

  // Remove presets de fábrica descontinuados para manter o acervo padrão sempre atualizado
  try {
    const currentPresetIds = new Set(DEFAULT_PRESET_ITEMS.filter(Boolean).map((item) => item.id));
    const allStoredItems = await db.items.toArray();
    const obsoleteIds = allStoredItems
      .filter((item) => !item.isCustom && !currentPresetIds.has(item.id))
      .map((item) => item.id);
    if (obsoleteIds.length > 0) {
      await db.items.bulkDelete(obsoleteIds);
    }
  } catch (err) {
    console.warn('Erro ao sincronizar presets obsoletos:', err);
  }

  // Insere/atualiza os presets de fábrica
  const seededItems = DEFAULT_PRESET_ITEMS.filter(Boolean).map((item) => ({
    ...item,
    createdAt: item.createdAt || timestamp
  }));
  await db.items.bulkPut(seededItems);

  // Sincroniza capas padrão de fábrica (remove obsoletas e insere as novas)
  try {
    const currentCoverIds = new Set(DEFAULT_THEME_COVERS.map((cover) => cover.id));
    const allStoredCovers = await db.covers.toArray();
    const oldFactoryCoverIds = [
      'cover-safari-1', 'cover-astronauta-1', 'cover-boho-1', 'cover-candy-1', 'cover-dourado-1',
      'cover-ripado-freijo', 'cover-marmore-gold', 'cover-floral-aquarela', 'cover-selva-safari', 'cover-azul-ouro-glamour'
    ];
    
    const obsoleteCoverIds = allStoredCovers
      .filter((cover) => {
        // Exclui capas antigas de demonstração
        if (oldFactoryCoverIds.includes(cover.id)) return true;
        // Exclui capas de fábrica que não pertencem mais aos presets atuais (mantendo uploads do usuário)
        if (!cover.isCustom && cover.themeName !== 'Minhas Estampas' && !currentCoverIds.has(cover.id)) return true;
        return false;
      })
      .map((cover) => cover.id);

    if (obsoleteCoverIds.length > 0) {
      await db.covers.bulkDelete(obsoleteCoverIds);
    }
  } catch (err) {
    console.warn('Erro ao sincronizar capas obsoletas:', err);
  }

  // Insere/atualiza as novas capas padrão de fábrica
  const seededCovers: CoverItemRecord[] = DEFAULT_THEME_COVERS.map((cover) => ({
    ...cover,
    isCustom: false,
    createdAt: timestamp
  }));
  await db.covers.bulkPut(seededCovers);
}

// Métodos auxiliares para Acervo de Peças
export async function getAllItems(): Promise<PresetItem[]> {
  return await db.items.toArray();
}

export async function getItemsByCategory(category?: string): Promise<PresetItem[]> {
  if (!category || category === 'todos') {
    return await db.items.toArray();
  }
  return await db.items.where('category').equals(category).toArray();
}

export async function addCustomItem(itemData: Partial<PresetItem>): Promise<PresetItem> {
  const newItem: PresetItem = {
    id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    name: itemData.name || 'Nova Peça do Acervo',
    category: itemData.category || 'mesas',
    type: itemData.type || 'generic',
    widthCm: Number(itemData.widthCm) || 50,
    heightCm: Number(itemData.heightCm) || 50,
    previewUrl: itemData.previewUrl || '',
    isCustom: true,
    stockQuantity: Number(itemData.stockQuantity) || 1,
    rentalPrice: Number(itemData.rentalPrice) || 0,
    notes: itemData.notes || '',
    createdAt: Date.now()
  };

  await db.items.add(newItem);
  return newItem;
}

export async function updateCustomItem(id: string, itemData: Partial<PresetItem>): Promise<PresetItem | null> {
  const item = await db.items.get(id);
  if (!item || !item.isCustom) return null;

  const updated: PresetItem = {
    ...item,
    name: itemData.name !== undefined ? itemData.name : item.name,
    category: itemData.category !== undefined ? itemData.category : item.category,
    type: itemData.type !== undefined ? itemData.type : item.type,
    widthCm: itemData.widthCm !== undefined ? Number(itemData.widthCm) : item.widthCm,
    heightCm: itemData.heightCm !== undefined ? Number(itemData.heightCm) : item.heightCm,
    previewUrl: itemData.previewUrl !== undefined ? itemData.previewUrl : item.previewUrl,
    stockQuantity: itemData.stockQuantity !== undefined ? Number(itemData.stockQuantity) : item.stockQuantity,
    rentalPrice: itemData.rentalPrice !== undefined ? Number(itemData.rentalPrice) : item.rentalPrice,
    notes: itemData.notes !== undefined ? itemData.notes : item.notes
  };

  await db.items.put(updated);
  return updated;
}

export async function getCustomItem(id: string): Promise<PresetItem | undefined> {
  return await db.items.get(id);
}

export async function deleteCustomItem(id: string): Promise<boolean> {
  const item = await db.items.get(id);
  if (item && item.isCustom) {
    await db.items.delete(id);
    return true;
  }
  return false;
}

// Métodos para Capas e Estampas
export async function getAllCovers(): Promise<CoverItemRecord[]> {
  return await db.covers.toArray();
}

export async function addCustomCover(coverData: Partial<CoverItemRecord>): Promise<CoverItemRecord> {
  const newCover: CoverItemRecord = {
    id: 'cover-' + Date.now(),
    themeName: coverData.themeName || 'Minhas Estampas',
    name: coverData.name || 'Nova Capa',
    targetType: coverData.targetType || 'all',
    imageUrl: coverData.imageUrl || '',
    isCustom: true,
    createdAt: Date.now()
  };
  await db.covers.add(newCover);
  return newCover;
}

export async function deleteCustomCover(id: string): Promise<boolean> {
  const cover = await db.covers.get(id);
  if (cover && cover.isCustom) {
    await db.covers.delete(id);
    return true;
  }
  return false;
}

// Métodos para Projetos / Cenários
export async function getAllProjects(): Promise<ProjectData[]> {
  return await db.projects.reverse().sortBy('updatedAt');
}

export async function saveProject(projectData: Partial<ProjectData>): Promise<ProjectData> {
  const projectId = projectData.id || ('proj-' + Date.now());
  const project: ProjectData = {
    id: projectId,
    title: projectData.title || 'Novo Cenário',
    clientName: projectData.clientName || '',
    notes: projectData.notes || '',
    elements: projectData.elements || [],
    wallTextureUrl: projectData.wallTextureUrl,
    floorTextureUrl: projectData.floorTextureUrl,
    thumbnailUrl: projectData.thumbnailUrl,
    updatedAt: Date.now(),
    createdAt: projectData.createdAt || Date.now()
  };
  await db.projects.put(project);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}
