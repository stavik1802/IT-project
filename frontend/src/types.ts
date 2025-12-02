// src/types.ts

export interface SearchParams {
  minPrice: number;
  maxPrice: number;
  area: string;
  bedrooms: number;
  minSqft: number;
  maxSqft: number;
}

export interface PropertyResult {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  sqft: number;
  estimatedRent: number;
  grossYield: number;
  url?: string;
}

export interface EvaluationResponse {
  averageRent: number;
  currency: string;
  properties: PropertyResult[];
}

export interface RentOnlyResponse {
  averageRent: number;
  currency: string;
}

export interface SearchLog {
  id: string;
  createdAt: string; // ISO string from backend
  params: SearchParams;
  averageRent: number;
  propertiesCount: number;
  bestYield?: number | null;
}
