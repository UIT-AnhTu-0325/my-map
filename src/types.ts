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
}
