
export interface MaisokuData {
  propertyName: string;
  price: string;
  location: string;
  access: string;
  layout: string;
  size: string;
  builtYear: string;
  managementFee: string;
  repairFund: string;
  features: string[];
  description: string;
  coverageRatio: string;
  floorAreaRatio: string;
  facilities: string;
  floor: string;
  restrictions: string; // 建物限制/用途地域
}

export enum Language {
  CHINESE = 'Traditional Chinese',
  ENGLISH = 'English'
}

export interface ProcessingState {
  isProcessing: boolean;
  status: string;
  error?: string;
}
