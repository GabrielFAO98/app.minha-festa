import type { BalloonPiece, BalloonPaletteConfig } from '../core/balloon-studio-engine';
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
  | 'panel_slat'
  | 'panel_half_moon'
  | 'shimmer_wall'
  | 'cylinder'
  | 'cylinder_fluted'
  | 'cube'
  | 'table'
  | 'table_skirt_scallop'
  | 'table_skirt_straight'
  | 'table_organic'
  | 'table_organic_bean'
  | 'table_organic_bean_m'
  | 'table_organic_bean_g'
  | 'table_drop'
  | 'table_side'
  | 'dresser_bombe'
  | 'balloon_arch'
  | 'balloon_arch_l'
  | 'balloon_arch_demi'
  | 'balloon_arch_cascade'
  | 'balloon_cluster_floor'
  | 'balloon_cluster_totem'
  | 'balloon_single'
  | 'balloon_bubble'
  | 'balloon_number'
  | 'rug_round'
  | 'rug_rect_3d'
  | 'rug_oval'
  | 'display'
  | 'moinho'
  | 'generic'
  | string;

export type SvgRole = 'structural' | 'modular' | 'photo';

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
  svgRole?: SvgRole;
  solidHitbox?: boolean;
  widthCm: number;
  heightCm: number;
  previewUrl: string;
  isCustom: boolean;
  stockQuantity: number;
  rentalPrice: number;
  notes?: string;
  createdAt?: number;
  customCoverUrl?: string | null;
  customColor?: string | null;
  tabletopColor?: string | null;
  tabletopCoverUrl?: string | null;
  tabletopOffsetX?: number;
  tabletopOffsetY?: number;
  tabletopScale?: number;
  coverOffsetX?: number;
  coverOffsetY?: number;
  coverScale?: number;
  modularColors?: string[] | null;
  balloonColors?: string[] | BalloonColors | null;
  instanceId?: string;
  currentColor?: string;
  availableColors?: string[];
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
  projectType?: 'scenario' | 'balloon';
  notes?: string;
  elements?: SceneElement[];
  balloonData?: {
    pieces: BalloonPiece[];
    palette: BalloonPaletteConfig;
    distributionMode?: 'mesclado' | 'degrade' | 'blocos';
    volumeLevel?: 'enxuto' | 'padrao' | 'cheio';
    selectedTemplateId?: string;
  };
  wallTextureUrl?: string;
  floorTextureUrl?: string;
  wallTexture?: string;
  floorTexture?: string;
  bgImageUrl?: string;
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
