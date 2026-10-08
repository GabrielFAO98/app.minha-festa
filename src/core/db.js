import Dexie from 'dexie';
import { DEFAULT_PRESET_ITEMS, DEFAULT_THEME_COVERS } from './presets-data.js';

// Inicialização do Banco IndexedDB com Dexie
export const db = new Dexie('MinhaFestaDB');

// Definição das tabelas e índices
db.version(1).stores({
  items: 'id, name, category, type, isCustom, createdAt',
  covers: 'id, themeName, targetType, createdAt',
  projects: 'id, title, clientName, updatedAt',
  settings: 'key'
});

// Inicialização e Carga dos Presets Padrão (Executa uma única vez)
export async function initDatabase() {
  const itemsCount = await db.items.count();
  if (itemsCount === 0) {
    const timestamp = Date.now();
    const seededItems = DEFAULT_PRESET_ITEMS.map(item => ({
      ...item,
      createdAt: timestamp
    }));
    await db.items.bulkAdd(seededItems);
  }

  const coversCount = await db.covers.count();
  if (coversCount === 0) {
    const timestamp = Date.now();
    const seededCovers = DEFAULT_THEME_COVERS.map(cover => ({
      ...cover,
      createdAt: timestamp
    }));
    await db.covers.bulkAdd(seededCovers);
  }
}

// Métodos auxiliares para Acervo de Peças
export async function getAllItems() {
  return await db.items.toArray();
}

export async function getItemsByCategory(category) {
  if (!category || category === 'todos') {
    return await db.items.toArray();
  }
  return await db.items.where('category').equals(category).toArray();
}

export async function addCustomItem(itemData) {
  const newItem = {
    id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    name: itemData.name || 'Nova Peça do Acervo',
    category: itemData.category || 'mesas',
    type: itemData.type || 'generic',
    widthCm: Number(itemData.widthCm) || 50,
    heightCm: Number(itemData.heightCm) || 50,
    previewUrl: itemData.previewUrl,
    isCustom: true,
    stockQuantity: Number(itemData.stockQuantity) || 1,
    rentalPrice: Number(itemData.rentalPrice) || 0,
    notes: itemData.notes || '',
    createdAt: Date.now()
  };

  await db.items.add(newItem);
  return newItem;
}

export async function deleteCustomItem(id) {
  const item = await db.items.get(id);
  if (item && item.isCustom) {
    await db.items.delete(id);
    return true;
  }
  return false;
}

// Métodos para Capas e Estampas
export async function getAllCovers() {
  return await db.covers.toArray();
}

export async function addCustomCover(coverData) {
  const newCover = {
    id: 'cover-' + Date.now(),
    themeName: coverData.themeName || 'Personalizado',
    name: coverData.name || 'Nova Capa',
    targetType: coverData.targetType || 'all',
    imageUrl: coverData.imageUrl,
    createdAt: Date.now()
  };
  await db.covers.add(newCover);
  return newCover;
}

// Métodos para Projetos / Cenários
export async function getAllProjects() {
  return await db.projects.reverse().sortBy('updatedAt');
}

export async function saveProject(projectData) {
  const projectId = projectData.id || ('proj-' + Date.now());
  const project = {
    ...projectData,
    id: projectId,
    updatedAt: Date.now()
  };
  await db.projects.put(project);
  return project;
}

export async function deleteProject(id) {
  await db.projects.delete(id);
}

