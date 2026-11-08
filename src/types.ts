export type DisplayMode = 'photo' | 'silhouette';

export type ContactType = 'wechat' | 'phone';

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: 'view' | 'planning';
  statusText: string;
  isBlurred?: boolean;
  description?: string;
  tags?: string[];
  bannerBg?: string;
  deliverables?: string[];
  imagePlaceholder?: string;
  videoUrl?: string;
  videoPoster?: string;
  websiteUrl?: string;
  brandDesign?: BrandDesignInfo;
}

export interface BrandColorItem {
  name: string;
  hex: string;
  role: string;
}

export interface BrandDesignInfo {
  concept: string;
  visualIdentity: string;
  colorPalette?: BrandColorItem[];
  guidelines?: string[];
}

export interface ContactInfo {
  wechatId: string;
  wechatQrLabel: string;
  phoneNumber: string;
  email: string;
}

export interface StageMetrics {
  scale: number;
  panX: number;
  panY: number;
  windowLeftInCanvas: number;
  windowRightInCanvas: number;
  titleScale: number;
  titleX: number;
  tornCenterX: number;
  viewportWidth: number;
}
