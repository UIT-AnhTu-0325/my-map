export interface Location {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  tiktokUrl: string;
  status: 'selling' | 'sold';
  createdAt: string;
  /** Optional real estate details */
  address?: string;
  landArea?: number;       // m²
  floorArea?: number;      // m²
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  frontWidth?: number;     // meters
  features?: string[];     // e.g. ["Ban công", "Hẻm thông"]
}
