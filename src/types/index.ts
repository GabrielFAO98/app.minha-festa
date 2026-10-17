// Tipos centrais da aplicação Minha Festa (Decoração Pegue-Monte)

export type ItemCategory =
  | 'todos'
  | 'paineis'
  | 'cilindros'
  | 'mesas'
  | 'baloes'
  | 'tapetes'
  | 'displays'
  | 'acessorios';

export type ItemType =
  | 'panel_round'
  | 'panel_arch'
  | 'panel_rect'
  | 'panel_half_moon'
  | 'shimmer_wall'
  | 'cylinder'
  | 'cube'
  | 'table'
  | 'table_organic'
  | 'table_drop'
  | 'table_side'
  | 'balloon_arch'
  | 'balloon_single'
  | 'balloon_bubble'
  | 'balloon_number'
  | 'rug_round'
  | 'rug_rect_3d'
  | 'rug_oval'
  | 'display'
  | 'generic'
  | string;

export interface BalloonColors {
  primary: string;
  secondary: string;
  accent: string;
  highlight?: string;
  [key: string]: string | undefined;
}

export interface PresetItem {
  id: string;
  name: string;
  category: ItemCategory | string;
  type: ItemType;
  widthCm: number;
  heightCm: number;
  previewUrl: string;
  isCustom: boolean;
  stockQuantity: number;
  rentalPrice: number;
  notes?: string;
  createdAt?: number;
  customCoverUrl?: string | null;
  balloonColors?: string[] | BalloonColors | null;
  instanceId?: string;
}

export type CoverTargetType = 'all' | 'panel_round' | 'panel_arch' | 'cylinder' | 'table' | 'rug' | string;

export interface ThemeCover {
  id: string;
  themeName: string;
  name: string;
  targetType: CoverTargetType;
  imageUrl: string;
  createdAt?: number;
}

export interface SceneElement extends PresetItem {
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  zIndex?: number;
}

export interface ProjectData {
  id: string;
  title: string;
  clientName?: string;
  notes?: string;
  elements: SceneElement[];
  wallTextureUrl?: string;
  floorTextureUrl?: string;
  wallTexture?: string;
  floorTexture?: string;
  updatedAt: number;
  createdAt?: number;
  thumbnailUrl?: string;
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  wallUrl: string;
  floorUrl: string;
  wallName?: string;
  floorName?: string;
}

export interface TextureOption {
  id: string;
  name: string;
  url: string;
}
